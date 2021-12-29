import { Injectable } from '@angular/core';
import { ItProvider } from '@features/instant-trade/services/instant-trade-service/models/ItProvider';
import InstantTrade from '@features/instant-trade/models/InstantTrade';
import { TransactionReceipt } from 'web3-eth';
import InstantTradeToken from '@features/instant-trade/models/InstantTradeToken';
import BigNumber from 'bignumber.js';
import { Observable, of } from 'rxjs';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { Account, Connection, SignatureResult, Transaction } from '@solana/web3.js';
import {
  ItSettingsForm,
  SettingsService
} from '@features/swaps/services/settings-service/settings.service';
import { HttpClient } from '@angular/common/http';
import { startWith } from 'rxjs/operators';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { RaydiumLiquidityManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-liquidity-manager';
import { SolanaWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import { LiquidityPoolInfo } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/pools';
import { WRAPPED_SOL } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import { RaydiumRoutingService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-routering.service';
import { RaydiumSwapManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-swap-manager';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import InsufficientLiquidityError from '@core/errors/models/instant-trade/insufficient-liquidity.error';
import { subtractPercent } from '@shared/utils/utils';
import CustomError from '@core/errors/models/custom-error';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

@Injectable({
  providedIn: 'root'
})
export class RaydiumService implements ItProvider {
  private settings: ItSettingsForm;

  private readonly connection: Connection;

  private readonly liquidityManager: RaydiumLiquidityManager;

  private poolInfo: LiquidityPoolInfo[];

  private readonly blockchainAdapter: SolanaWeb3Public;

  private readonly swapManager: RaydiumSwapManager;

  public get providerType(): INSTANT_TRADES_PROVIDER {
    return INSTANT_TRADES_PROVIDER.RAYDIUM;
  }

  constructor(
    private readonly httpClient: HttpClient,
    private readonly settingsService: SettingsService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly priceImpactService: PriceImpactService,
    private readonly tokensService: TokensService,
    private readonly solanaPrivateAdapterService: SolanaWeb3PrivateService,
    private readonly raydiumRoutingService: RaydiumRoutingService
  ) {
    this.blockchainAdapter = this.publicBlockchainAdapterService[BLOCKCHAIN_NAME.SOLANA];
    this.connection = this.blockchainAdapter.connection;
    solanaPrivateAdapterService.connection = this.connection;
    this.swapManager = new RaydiumSwapManager(
      this.solanaPrivateAdapterService,
      this.blockchainAdapter,
      this.connection
    );
    this.settingsService.instantTradeValueChanges
      .pipe(startWith(this.settingsService.instantTradeValue))
      .subscribe(settingsForm => {
        this.settings = {
          ...settingsForm,
          slippageTolerance: settingsForm.slippageTolerance / 100
        };
      });
    this.liquidityManager = new RaydiumLiquidityManager(
      httpClient,
      this.blockchainAdapter,
      this.solanaPrivateAdapterService
    );
  }

  public async getFromAmount(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    aIn: BigNumber
  ): Promise<BigNumber> {
    const pool = this.raydiumRoutingService.currentPoolInfo;
    const { amountOut } = this.raydiumRoutingService.getSwapOutAmount(
      pool,
      fromToken.address,
      toToken.address,
      aIn.toString(),
      this.settings.slippageTolerance
    );
    return new BigNumber(aIn)
      .multipliedBy(100)
      .dividedBy(amountOut)
      .multipliedBy(10 ** fromToken.decimals);
  }

  public approve(): Promise<void> {
    return;
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    if (this.isWrap(fromToken.address, toToken.address)) {
      return this.swapManager.getInstantTradeInfo(fromToken, toToken, fromAmount, fromAmount);
    }

    const directPoolInfos = await this.liquidityManager.requestInfos(
      fromToken.symbol,
      toToken.symbol,
      this.tokensService.tokens.filter(el => el.blockchain === BLOCKCHAIN_NAME.SOLANA),
      false
    );

    // @TODO Solana. Remove filter by serum.
    const amms = Object.values(directPoolInfos).filter(
      pool =>
        pool.version === 4 && pool.serumBids !== '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD'
    );

    if (amms?.length) {
      const { amountOut, priceImpact, bestRoute } = amms.reduce(
        (acc, pool, index) => {
          const { amountOut: poolAmountOut, priceImpact: poolPriceImpact } =
            this.raydiumRoutingService.getSwapOutAmount(
              pool,
              fromToken.address,
              toToken.address,
              fromAmount.toString(),
              this.settings.slippageTolerance
            );
          if (poolAmountOut.gt(acc.amountOut)) {
            this.poolInfo = [pool];
            return { amountOut: poolAmountOut, priceImpact: poolPriceImpact, bestRoute: index };
          }
          return acc;
        },
        {
          amountOut: new BigNumber(0),
          priceImpact: 100,
          bestRoute: 0
        }
      );

      this.raydiumRoutingService.currentPoolInfo = amms[bestRoute];
      this.priceImpactService.setPriceImpact(priceImpact);
      return this.swapManager.getInstantTradeInfo(fromToken, toToken, fromAmount, amountOut);
    }

    // @TODO Solana routing.
    // const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;
    // if (fromBlockchain !== toBlockchain) {
    //   const poolInfos = await this.liquidityManager.requestInfos(
    //     fromToken.symbol,
    //     toToken.symbol,
    //     this.tokensService.tokens.filter(el => el.blockchain === BLOCKCHAIN_NAME.SOLANA),
    //     true
    //   );
    //
    //   const { maxAmountOut, middleCoin, priceImpact } = this.raydiumRoutingService.calculate(
    //     poolInfos,
    //     fromToken,
    //     toToken,
    //     fromAmount,
    //     this.settings.slippageTolerance
    //   );
    //   if (maxAmountOut) {
    //     const poolInfoA = Object.values(poolInfos)
    //       .filter(
    //         p =>
    //           (p.coin.mintAddress === fromToken.address &&
    //             p.pc.mintAddress === middleCoin.address) ||
    //           (p.coin.mintAddress === middleCoin.address && p.pc.mintAddress === fromToken.address)
    //       )
    //       .pop();
    //     const poolInfoB = Object.values(poolInfos)
    //       .filter(
    //         p =>
    //           (p.coin.mintAddress === middleCoin.address && p.pc.mintAddress === toToken.address) ||
    //           (p.coin.mintAddress === toToken.address && p.pc.mintAddress === middleCoin.address)
    //       )
    //       .pop();
    //     this.poolInfo = [poolInfoA, poolInfoB];
    //     this.priceImpactService.setPriceImpact(priceImpact);
    //
    //     return this.swapManager.getInstantTradeInfo(
    //       fromToken,
    //       toToken,
    //       fromAmount,
    //       maxAmountOut,
    //       middleCoin
    //     );
    //   }
    // }
    throw new InsufficientLiquidityError('CrossChainRouting');
  }

  public async createTrade(
    trade: InstantTrade,
    options: { onConfirm?: (hash: string) => Promise<void> }
  ): Promise<Partial<TransactionReceipt>> {
    try {
      const solanaTokens = this.tokensService.tokens.filter(
        el => el.blockchain === BLOCKCHAIN_NAME.SOLANA
      );
      const isWrap = this.isWrap(trade.from.token.address, trade.to.token.address);
      const fromNativeSol = trade.from.token.address === NATIVE_SOLANA_MINT_ADDRESS;

      let transaction;
      let signers;
      if (isWrap) {
        const wrapResult = fromNativeSol
          ? await this.swapManager.wrapSol(trade, this.walletConnectorService.address, solanaTokens)
          : await this.swapManager.unwrapSol(this.walletConnectorService.address);
        transaction = wrapResult.transaction;
        signers = wrapResult.signers;
      } else {
        const swapResult =
          trade.path.length > 2
            ? await this.swapManager.createRouteSwap(
                this.poolInfo[0],
                this.poolInfo[1],
                this.raydiumRoutingService.routerInfo,
                trade.from.token,
                trade.to.token,
                trade.from.amount,
                trade.to.amount,
                this.walletConnectorService.address,
                trade.from.token.decimals,
                trade.to.token.decimals
              )
            : await this.swapManager.createSwapTransaction(
                this.poolInfo[0],
                trade.from.token.address,
                trade.to.token.address,
                trade.from.amount,
                subtractPercent(trade.to.amount, this.settings.slippageTolerance),
                trade.from.token.decimals,
                trade.to.token.decimals,
                this.walletConnectorService.address,
                solanaTokens
              );
        transaction = swapResult.transaction;
        signers = swapResult.signers;
      }

      const hash = await this.addMetaAndSend(transaction, signers);

      await options.onConfirm(hash);
      await new Promise((resolve, reject) => {
        this.connection.onSignature(hash, (signatureResult: SignatureResult) => {
          if (!signatureResult.err) {
            resolve(hash);
          } else {
            reject(signatureResult.err);
          }
        });
      });
      return {
        from: this.walletConnectorService.address,
        transactionHash: hash
      };
    } catch (err) {
      if ('message' in err) {
        throw new CustomError(err.message);
      }
    }
  }

  public async addMetaAndSend(transaction: Transaction, signers: Account[]): Promise<string> {
    await this.swapManager.addTransactionMeta(transaction, this.walletConnectorService.address);
    if (signers?.length) {
      transaction.partialSign(...signers);
    }

    const trx = await this.blockchainAdapter.signTransaction(
      this.walletConnectorService.provider as CommonWalletAdapter<SolanaWallet>,
      transaction,
      signers
    );

    return this.connection?.sendRawTransaction(trx?.serialize());
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    console.log(tokenAddress);
    return of(new BigNumber(NaN));
  }

  private isWrap(fromAddress: string, toAddress: string): boolean {
    return (
      (fromAddress === NATIVE_SOLANA_MINT_ADDRESS && toAddress === WRAPPED_SOL.mintAddress) ||
      (fromAddress === WRAPPED_SOL.mintAddress && toAddress === NATIVE_SOLANA_MINT_ADDRESS)
    );
  }
}

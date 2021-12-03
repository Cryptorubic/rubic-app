import { Injectable } from '@angular/core';
import { ItProvider } from '@features/instant-trade/services/instant-trade-service/models/ItProvider';
import InstantTrade from '@features/instant-trade/models/InstantTrade';
import { TransactionReceipt } from 'web3-eth';
import InstantTradeToken from '@features/instant-trade/models/InstantTradeToken';
import BigNumber from 'bignumber.js';
import { Observable, of } from 'rxjs';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { Connection } from '@solana/web3.js';
import {
  ItSettingsForm,
  SettingsService
} from '@features/swaps/services/settings-service/settings.service';
import { HttpClient } from '@angular/common/http';
import { startWith } from 'rxjs/operators';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { SolanaWeb3Public } from '@core/services/blockchain/web3/web3-public-service/SolanaWeb3Public';
import { RaydiumLiquidityManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-liquidity-manager';
import { SolanaWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { SolanaWeb3Private } from '@core/services/blockchain/web3/web3-private-service/solana-web3-private';
import { LiquidityPoolInfo } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/pools';
import {
  NATIVE_SOL,
  WRAPPED_SOL
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import { SolanaRouter } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-router-info';
import { RaydiumSwapManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-swap-manager';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import { TokensService } from '@core/services/tokens/tokens.service';

@Injectable({
  providedIn: 'root'
})
export class RaydiumService implements ItProvider {
  private settings: ItSettingsForm;

  private readonly connection: Connection;

  private readonly liquidityManager: RaydiumLiquidityManager;

  private poolInfo: LiquidityPoolInfo[];

  private readonly blockchainAdapter: SolanaWeb3Public;

  private readonly privateBlockchainAdapter: SolanaWeb3Private;

  private readonly solanaRouter: SolanaRouter;

  private readonly swapManager: RaydiumSwapManager;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly settingsService: SettingsService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly priceImpactService: PriceImpactService,
    private readonly tokensService: TokensService
  ) {
    this.blockchainAdapter = this.publicBlockchainAdapterService[BLOCKCHAIN_NAME.SOLANA];
    this.connection = this.blockchainAdapter.connection;
    this.privateBlockchainAdapter = new SolanaWeb3Private(this.connection);
    this.solanaRouter = new SolanaRouter();
    this.swapManager = new RaydiumSwapManager(
      this.privateBlockchainAdapter,
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
      this.privateBlockchainAdapter
    );
  }

  public approve(
    tokenAddress: string,
    options: { onTransactionHash?: (hash: string) => void }
  ): Promise<void> {
    console.log(tokenAddress, options);
    return Promise.resolve(undefined);
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    if (this.isWrap(fromToken.address, toToken.address)) {
      return this.swapManager.getInstantTradeInfo(fromToken, toToken, fromAmount, fromAmount);
    }

    const poolInfos = await this.liquidityManager.requestInfos(
      fromToken.symbol,
      toToken.symbol,
      this.tokensService.tokens.filter(el => el.blockchain === BLOCKCHAIN_NAME.SOLANA)
    );
    const amms = Object.values(poolInfos).filter(
      p =>
        p.version === 4 &&
        p.status === 1 &&
        ((p.coin.mintAddress === fromToken.address && p.pc.mintAddress === toToken.address) ||
          (p.coin.mintAddress === toToken.address && p.pc.mintAddress === fromToken.address))
    );

    if (amms?.length) {
      const pool = amms.pop();
      this.poolInfo = [pool];
      const { amountOut, priceImpact } = this.solanaRouter.getSwapOutAmount(
        pool,
        fromToken.address,
        toToken.address,
        fromAmount.toString(),
        this.settings.slippageTolerance
      );
      this.priceImpactService.setPriceImpact(priceImpact);
      return this.swapManager.getInstantTradeInfo(fromToken, toToken, fromAmount, amountOut);
    }

    const { maxAmountOut, middleCoin, priceImpact } = this.solanaRouter.calculate(
      poolInfos,
      fromToken,
      toToken,
      fromAmount,
      this.settings.slippageTolerance
    );
    if (maxAmountOut) {
      const poolInfoA = Object.values(poolInfos)
        .filter(
          p =>
            (p.coin.mintAddress === fromToken.address && p.pc.mintAddress === middleCoin.address) ||
            (p.coin.mintAddress === middleCoin.address && p.pc.mintAddress === fromToken.address)
        )
        .pop();
      const poolInfoB = Object.values(poolInfos)
        .filter(
          p =>
            (p.coin.mintAddress === middleCoin.address && p.pc.mintAddress === toToken.address) ||
            (p.coin.mintAddress === toToken.address && p.pc.mintAddress === middleCoin.address)
        )
        .pop();
      this.poolInfo = [poolInfoA, poolInfoB];
      this.priceImpactService.setPriceImpact(priceImpact);

      return this.swapManager.getInstantTradeInfo(
        fromToken,
        toToken,
        fromAmount,
        maxAmountOut,
        middleCoin
      );
    }
    return null;
  }

  public async createTrade(trade: InstantTrade): Promise<Partial<TransactionReceipt>> {
    if (this.isWrap(trade.from.token.address, trade.to.token.address)) {
      // @TODO Solana.
      // const hash = await this.wrap(trade);
      // return {
      //   transactionHash: hash
      // };
    }
    const solanaTokens = this.tokensService.tokens.filter(
      el => el.blockchain === BLOCKCHAIN_NAME.SOLANA
    );
    const { transaction, signers } =
      trade.path.length > 2
        ? await this.swapManager.createRouteSwap(
            this.poolInfo[0],
            this.poolInfo[1],
            this.solanaRouter.value,
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
            trade.to.amount,
            trade.from.token.decimals,
            trade.to.token.decimals,
            this.walletConnectorService.address,
            solanaTokens
          );
    await this.swapManager.addTransactionMeta(transaction, this.walletConnectorService.address);

    if (signers?.length) {
      transaction.partialSign(...signers);
    }

    const trx = await this.blockchainAdapter.signTransaction(
      this.walletConnectorService.provider as CommonWalletAdapter<SolanaWallet>,
      transaction,
      signers
    );
    const rawTransaction = trx?.serialize();
    const hash = await this.connection?.sendRawTransaction(rawTransaction);
    return {
      from: this.walletConnectorService.address,
      transactionHash: hash
    };
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    console.log(tokenAddress);
    return of(new BigNumber(NaN));
  }

  private isWrap(fromAddress: string, toAddress: string): boolean {
    return (
      (fromAddress === NATIVE_SOL.mintAddress && toAddress === WRAPPED_SOL.mintAddress) ||
      (fromAddress === WRAPPED_SOL.mintAddress && toAddress === NATIVE_SOL.mintAddress)
    );
  }
}

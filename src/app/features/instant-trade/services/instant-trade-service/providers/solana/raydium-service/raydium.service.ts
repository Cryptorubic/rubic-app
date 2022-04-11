import { Injectable } from '@angular/core';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { TransactionReceipt } from 'web3-eth';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { Connection, SignatureResult, TransactionError } from '@solana/web3.js';
import {
  ItSettingsForm,
  SettingsService
} from '@features/swaps/services/settings-service/settings.service';
import { startWith } from 'rxjs/operators';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { RaydiumLiquidityManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-liquidity-manager';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import { LiquidityPoolInfo } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/pools';
import { RaydiumRouterManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-router-manager';
import { RaydiumSwapManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-swap-manager';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import InsufficientLiquidityError from '@core/errors/models/instant-trade/insufficient-liquidity-error';
import { ItProvider } from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { ROUTE_SWAP_PROGRAM_ID } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/accounts';
import { RaydiumStableManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-stable-manager';
import { RaydiumWrapManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-wrap-manager';
import { RaydiumManagers } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/raydium-managers';
import { HttpService } from '@core/services/http/http.service';
import { BaseTransaction } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-types';
import CustomError from '@core/errors/models/custom-error';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

@Injectable({
  providedIn: 'root'
})
export class RaydiumService implements ItProvider {
  public readonly providerType = INSTANT_TRADE_PROVIDER.RAYDIUM;

  public readonly contractAddress = ROUTE_SWAP_PROGRAM_ID;

  private settings: ItSettingsForm;

  private readonly connection: Connection;

  private readonly liquidityManager: RaydiumLiquidityManager;

  private poolInfo: LiquidityPoolInfo[];

  private readonly blockchainAdapter: SolanaWeb3Public;

  private readonly swapManager: RaydiumSwapManager;

  private readonly stableSwapManager: RaydiumStableManager;

  private readonly wrapManager: RaydiumWrapManager;

  public readonly routerManager: RaydiumRouterManager;

  private static handleRaydiumError(err: TransactionError | null): CustomError {
    if (typeof err === 'string') {
      return new CustomError(err);
    } else if ('InstructionError' in err) {
      const error = err as { InstructionError: ({ [key: string]: number } | 0)[] };
      const instructionError = error.InstructionError.find(el => el !== 0);
      const [message, code] = Object.entries(instructionError)[0];
      const resultError = new CustomError(`Error: ${message}`);
      resultError.code = code || 0;
      return resultError;
    }
    return new CustomError('Unknown Error');
  }

  constructor(
    private readonly httpClient: HttpService,
    private readonly settingsService: SettingsService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly priceImpactService: PriceImpactService,
    private readonly tokensService: TokensService,
    private readonly privateAdapterService: SolanaWeb3PrivateService
  ) {
    this.blockchainAdapter = this.publicBlockchainAdapterService[BLOCKCHAIN_NAME.SOLANA];
    this.connection = this.blockchainAdapter.connection;
    privateAdapterService.connection = this.connection;

    [
      this.stableSwapManager,
      this.swapManager,
      this.wrapManager,
      this.routerManager,
      this.liquidityManager
    ] = this.initManagers();

    this.settingsService.instantTradeValueChanges
      .pipe(startWith(this.settingsService.instantTradeValue))
      .subscribe(settingsForm => {
        this.settings = {
          ...settingsForm,
          slippageTolerance: settingsForm.slippageTolerance / 100
        };
      });
  }

  private initManagers(): RaydiumManagers {
    const stableSwapManager = new RaydiumStableManager();
    const swapManager = new RaydiumSwapManager(
      this.walletConnectorService,
      this.privateAdapterService,
      this.blockchainAdapter,
      this.connection
    );
    const wrapManager = new RaydiumWrapManager(
      this.privateAdapterService,
      this.walletConnectorService
    );
    const routerManager = new RaydiumRouterManager(
      this.privateAdapterService,
      this.walletConnectorService
    );
    const liquidityManager = new RaydiumLiquidityManager(
      this.httpClient,
      this.blockchainAdapter,
      this.privateAdapterService
    );
    return [stableSwapManager, swapManager, wrapManager, routerManager, liquidityManager];
  }

  public approve(): Promise<void> {
    return;
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    try {
      if (RaydiumWrapManager.isWrap(fromToken.address, toToken.address)) {
        return RaydiumSwapManager.getInstantTradeInfo(fromToken, toToken, fromAmount, fromAmount);
      }
      const directPoolInfos = Object.values(
        await this.liquidityManager.requestInfos(
          fromToken.symbol,
          toToken.symbol,
          this.tokensService.tokens.filter(el => el.blockchain === BLOCKCHAIN_NAME.SOLANA),
          false
        )
      );

      if (directPoolInfos?.length) {
        const { amountOut, priceImpact, poolInfo } = this.swapManager.calculateSwap(
          directPoolInfos,
          fromToken,
          fromAmount,
          toToken,
          this.settings.slippageTolerance,
          this.routerManager
        );

        this.poolInfo = poolInfo;
        this.priceImpactService.setPriceImpact(priceImpact);
        return RaydiumSwapManager.getInstantTradeInfo(fromToken, toToken, fromAmount, amountOut);
      } else {
        const { maxAmountOut, middleCoin, priceImpact, poolInfo } =
          await this.routerManager.calculateTrade(
            this.liquidityManager,
            fromToken,
            fromAmount,
            toToken,
            this.settings.slippageTolerance,
            this.tokensService.tokens.filter(el => el.blockchain === BLOCKCHAIN_NAME.SOLANA)
          );

        this.poolInfo = poolInfo;
        this.priceImpactService.setPriceImpact(priceImpact);

        return RaydiumSwapManager.getInstantTradeInfo(
          fromToken,
          toToken,
          fromAmount,
          maxAmountOut,
          middleCoin
        );
      }
    } catch (err) {
      console.debug(err);
      throw new InsufficientLiquidityError('CrossChainRouting');
    }
  }

  public async createTrade(
    trade: InstantTrade,
    options: { onConfirm?: (hash: string) => Promise<void> }
  ): Promise<Partial<TransactionReceipt>> {
    const solBalance = Web3Pure.fromWei(
      await this.blockchainAdapter.getTokenOrNativeBalance(
        this.walletConnectorService.address,
        NATIVE_SOLANA_MINT_ADDRESS
      ),
      9
    );
    const limitValue = '0.05';
    if (solBalance.lte(limitValue)) {
      throw new CustomError(
        `Insufficient SOL balance. You have to have at least ${limitValue} SOL to make a transaction.`
      );
    }
    const tradeData = await this.getTrade(trade);
    const hash = await this.blockchainAdapter.signAndSendRaydiumTransaction(
      tradeData,
      this.walletConnectorService
    );
    await options.onConfirm(hash);

    await new Promise((resolve, reject) => {
      this.connection.onSignature(hash, (signatureResult: SignatureResult) => {
        if (!signatureResult.err) {
          resolve(hash);
        } else {
          reject(RaydiumService.handleRaydiumError(signatureResult.err));
        }
      });
    });

    return {
      from: this.walletConnectorService.address,
      transactionHash: hash
    };
  }

  public async getAllowance(_tokenAddress: string): Promise<BigNumber> {
    return new BigNumber(NaN);
  }

  private async getTrade(trade: InstantTrade): Promise<BaseTransaction> {
    const solanaTokens = this.tokensService.tokens.filter(
      el => el.blockchain === BLOCKCHAIN_NAME.SOLANA
    );
    const isWrap = RaydiumWrapManager.isWrap(trade.from.token.address, trade.to.token.address);

    if (isWrap) {
      return this.wrapManager.createWrapTrade(trade, solanaTokens);
    } else if (trade.path.length > 2) {
      return this.routerManager.createRouteSwap(
        this.poolInfo,
        trade,
        this.settings.slippageTolerance
      );
    }
    return this.swapManager.createSwapTrade(
      this.poolInfo,
      trade,
      solanaTokens,
      this.settings.slippageTolerance
    );
  }
}

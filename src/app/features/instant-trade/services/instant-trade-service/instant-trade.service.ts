import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { OneInchEthService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/one-inch-eth-service/one-inch-eth.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import BigNumber from 'bignumber.js';
import { TuiNotification } from '@taiga-ui/core';
import { forkJoin, Observable, of, Subscription, timer } from 'rxjs';
import { UniSwapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v2-service/uni-swap-v2.service';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { INSTANT_TRADES_TRADE_STATUS } from 'src/app/features/swaps/models/INSTANT_TRADES_TRADE_STATUS';
import { InstantTradesApiService } from 'src/app/core/services/backend/instant-trades-api/instant-trades-api.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { OneInchPolService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/one-inch-polygon-service/one-inch-pol.service';
import { QuickSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap.service';
import { PancakeSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pancake-swap.service';
import { OneInchBscService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/one-inch-bsc-service/one-inch-bsc.service';
import { ItProvider } from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { TranslateService } from '@ngx-translate/core';
import { SushiSwapPolygonService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/sushi-swap-polygon-service/sushi-swap-polygon.service';
import { SushiSwapEthService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/sushi-swap-eth-service/sushi-swap-eth.service';
import { SushiSwapBscService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/sushi-swap-bsc-service/sushi-swap-bsc.service';
import { SushiSwapHarmonyService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/harmony/sushi-swap-harmony/sushi-swap-harmony.service';
import CustomError from 'src/app/core/errors/models/custom-error';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { minGasPriceInBlockchain } from 'src/app/features/instant-trade/services/instant-trade-service/constants/minGasPriceInBlockchain';
import { shouldCalculateGasInBlockchain } from 'src/app/features/instant-trade/services/instant-trade-service/constants/shouldCalculateGasInBlockchain';

@Injectable({
  providedIn: 'root'
})
export class InstantTradeService {
  private blockchainsProviders: Partial<
    {
      [blockchain in BLOCKCHAIN_NAME]: Partial<
        {
          [provider in INSTANT_TRADES_PROVIDER]: ItProvider;
        }
      >;
    }
  >;

  private modalShowing: Subscription;

  constructor(
    // Providers start
    private readonly oneInchEthService: OneInchEthService,
    private readonly uniswapV2Service: UniSwapV2Service,
    private readonly oneInchPolygonService: OneInchPolService,
    private readonly pancakeSwapService: PancakeSwapService,
    private readonly quickSwapService: QuickSwapService,
    private readonly oneInchBscService: OneInchBscService,
    private readonly sushiSwapEthService: SushiSwapEthService,
    private readonly sushiSwapPolygonService: SushiSwapPolygonService,
    private readonly sushiSwapBscService: SushiSwapBscService,
    private readonly sushiSwapHarmonyService: SushiSwapHarmonyService,
    // Providers end
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly errorService: ErrorsService,
    private readonly swapFormService: SwapFormService,
    private readonly web3Public: Web3PublicService,
    private translateService: TranslateService,
    private notificationsService: NotificationsService
  ) {
    this.setBlockchainsProviders();
  }

  private setBlockchainsProviders(): void {
    this.blockchainsProviders = {
      [BLOCKCHAIN_NAME.ETHEREUM]: {
        [INSTANT_TRADES_PROVIDER.ONEINCH]: this.oneInchEthService,
        [INSTANT_TRADES_PROVIDER.UNISWAP]: this.uniswapV2Service,
        [INSTANT_TRADES_PROVIDER.SUSHISWAP]: this.sushiSwapEthService
      },
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        [INSTANT_TRADES_PROVIDER.ONEINCH]: this.oneInchBscService,
        [INSTANT_TRADES_PROVIDER.PANCAKESWAP]: this.pancakeSwapService,
        [INSTANT_TRADES_PROVIDER.SUSHISWAP]: this.sushiSwapBscService
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        [INSTANT_TRADES_PROVIDER.ONEINCH]: this.oneInchPolygonService,
        [INSTANT_TRADES_PROVIDER.QUICKSWAP]: this.quickSwapService,
        [INSTANT_TRADES_PROVIDER.SUSHISWAP]: this.sushiSwapPolygonService
      },
      [BLOCKCHAIN_NAME.HARMONY]: {
        [INSTANT_TRADES_PROVIDER.SUSHISWAP]: this.sushiSwapHarmonyService
      }
    };
  }

  public async calculateTrades(
    providersNames: INSTANT_TRADES_PROVIDER[]
  ): Promise<PromiseSettledResult<InstantTrade>[]> {
    const { fromAmount, fromToken, toToken, fromBlockchain } = this.swapFormService.inputValue;

    const shouldCalculateGas = shouldCalculateGasInBlockchain[fromBlockchain];
    const minGasPrice = minGasPriceInBlockchain[fromBlockchain];

    const providers = providersNames.map(
      providerName => this.blockchainsProviders[fromBlockchain][providerName]
    );
    const providersDataPromises = providers.map(async (provider: ItProvider) =>
      provider.calculateTrade(fromToken, fromAmount, toToken, shouldCalculateGas, minGasPrice)
    );
    return Promise.allSettled(providersDataPromises);
  }

  public async createTrade(provider: INSTANT_TRADES_PROVIDER, trade: InstantTrade): Promise<void> {
    let transactionHash: string;
    try {
      const receipt = await this.blockchainsProviders[trade.blockchain][provider].createTrade(
        trade,
        {
          onConfirm: async hash => {
            this.modalShowing = this.notificationsService.show(
              this.translateService.instant('notifications.tradeInProgress'),
              {
                status: TuiNotification.Info,
                autoClose: false
              }
            );
            transactionHash = hash;

            await this.postTrade(hash, provider, trade);
          }
        }
      );

      this.modalShowing.unsubscribe();
      this.updateTrade(transactionHash, INSTANT_TRADES_TRADE_STATUS.COMPLETED);
      this.notificationsService.show(
        this.translateService.instant('notifications.successfulTradeTitle'),
        {
          status: TuiNotification.Success
        }
      );

      await this.instantTradesApiService
        .notifyInstantTradesBot({
          provider,
          blockchain: trade.blockchain,
          walletAddress: receipt.from,
          trade,
          txHash: transactionHash
        })
        .catch(_err => {
          const error = new CustomError('Notify Instant Trade bot failed');
          error.displayError = false;
          throw error;
        });
    } catch (err) {
      this.modalShowing?.unsubscribe();
      if (transactionHash) {
        this.updateTrade(transactionHash, INSTANT_TRADES_TRADE_STATUS.REJECTED);
      }

      throw err;
    }
  }

  private async postTrade(hash: string, provider: INSTANT_TRADES_PROVIDER, trade: InstantTrade) {
    const web3Public = this.web3Public[trade.blockchain];
    await web3Public.getTransactionByHash(hash, 0, 60, 1000);
    timer(1000)
      .pipe(
        switchMap(() =>
          this.instantTradesApiService.createTrade(hash, provider, trade, trade.blockchain)
        )
      )
      .subscribe();
  }

  private updateTrade(hash: string, status: INSTANT_TRADES_TRADE_STATUS) {
    return this.instantTradesApiService.patchTrade(hash, status).subscribe({
      error: err => console.debug('IT patch request is failed', err)
    });
  }

  public getApprove(providersNames: INSTANT_TRADES_PROVIDER[]): Observable<boolean[]> | never {
    const { fromToken, fromAmount, fromBlockchain } = this.swapFormService.inputValue;
    const providers = providersNames.map(
      providerName => this.blockchainsProviders[fromBlockchain][providerName]
    );
    const providerApproveData = providers.map((provider: ItProvider) =>
      provider.getAllowance(fromToken.address).pipe(
        catchError(err => {
          console.debug(err);
          return of(null);
        })
      )
    );

    return forkJoin(providerApproveData).pipe(
      map((approveArray: BigNumber[]) => {
        return approveArray.map(el => fromAmount.gt(el));
      })
    );
  }

  public async approve(provider: INSTANT_TRADES_PROVIDER, trade: InstantTrade): Promise<void> {
    try {
      await this.blockchainsProviders[trade.blockchain][provider].approve(
        trade.from.token.address,
        {
          onTransactionHash: () => {
            this.modalShowing = this.notificationsService.show(
              this.translateService.instant('notifications.approveInProgress'),
              {
                status: TuiNotification.Info,
                autoClose: false
              }
            );
          }
        }
      );
      this.modalShowing.unsubscribe();
      this.notificationsService.show(
        this.translateService.instant('notifications.successApprove'),
        {
          status: TuiNotification.Success
        }
      );
    } catch (err) {
      this.modalShowing?.unsubscribe();
      throw err;
    }
  }
}

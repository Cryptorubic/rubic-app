import { Inject, Injectable, Injector } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { OneInchEthService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/one-inch-eth-service/one-inch-eth.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import BigNumber from 'bignumber.js';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { forkJoin, Observable, of, Subscription, timer } from 'rxjs';
import { UniSwapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v2-service/uni-swap-v2.service';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { InstantTradesApiService } from 'src/app/core/services/backend/instant-trades-api/instant-trades-api.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3/web3-public-service/web3-public.service';
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
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { shouldCalculateGasInBlockchain } from 'src/app/features/instant-trade/services/instant-trade-service/constants/shouldCalculateGasInBlockchain';
import { SuccessTxModalService } from 'src/app/features/swaps/services/success-tx-modal-service/success-tx-modal.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SuccessTrxNotificationComponent } from 'src/app/shared/components/success-trx-notification/success-trx-notification.component';
import { EthWethSwapProviderService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/eth-weth-swap-provider.service';
import { WINDOW } from '@ng-web-apis/common';
import { ZrxService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/zrx/zrx.service';
import { UniSwapV3Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/uni-swap-v3.service';
import { SushiSwapAvalancheService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/sushi-swap-avalanche-service/sushi-swap-avalanche-service.service';
import { PangolinAvalancheService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/pangolin-avalanche-service/pangolin-avalanche.service';
import { JoeAvalancheService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/joe-avalanche-service/joe-avalanche.service';
import { RubicWindow } from 'src/app/shared/utils/rubic-window';
import { Queue } from 'src/app/shared/models/utils/queue';
import CustomError from 'src/app/core/errors/models/custom-error';

@Injectable({
  providedIn: 'root'
})
export class InstantTradeService {
  private static readonly unsupportedItNetworks = [BLOCKCHAIN_NAME.TRON, BLOCKCHAIN_NAME.XDAI];

  private blockchainsProviders: Partial<
    Record<BLOCKCHAIN_NAME, Partial<Record<INSTANT_TRADES_PROVIDER, ItProvider>>>
  >;

  private readonly modalSubscriptions: Queue<Subscription>;

  public static isSupportedBlockchain(blockchain: BLOCKCHAIN_NAME): boolean {
    return !InstantTradeService.unsupportedItNetworks.includes(blockchain);
  }

  constructor(
    // Providers start
    private readonly oneInchEthService: OneInchEthService,
    private readonly uniswapV2Service: UniSwapV2Service,
    private readonly uniswapV3Service: UniSwapV3Service,
    private readonly oneInchPolygonService: OneInchPolService,
    private readonly pancakeSwapService: PancakeSwapService,
    private readonly quickSwapService: QuickSwapService,
    private readonly oneInchBscService: OneInchBscService,
    private readonly sushiSwapEthService: SushiSwapEthService,
    private readonly sushiSwapPolygonService: SushiSwapPolygonService,
    private readonly sushiSwapBscService: SushiSwapBscService,
    private readonly sushiSwapHarmonyService: SushiSwapHarmonyService,
    private readonly sushiSwapAvalancheService: SushiSwapAvalancheService,
    private readonly ethWethSwapProvider: EthWethSwapProviderService,
    private readonly zrxService: ZrxService,
    private readonly pangolinAvalancheService: PangolinAvalancheService,
    private readonly joeAvalancheService: JoeAvalancheService,
    // Providers end
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly errorService: ErrorsService,
    private readonly swapFormService: SwapFormService,
    private readonly web3Public: Web3PublicService,
    private readonly translateService: TranslateService,
    private readonly notificationsService: NotificationsService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly successTxModalService: SuccessTxModalService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {
    this.modalSubscriptions = new Queue<Subscription>();
    this.setBlockchainsProviders();
  }

  private setBlockchainsProviders(): void {
    this.blockchainsProviders = {
      [BLOCKCHAIN_NAME.ETHEREUM]: {
        [INSTANT_TRADES_PROVIDER.ONEINCH]: this.oneInchEthService,
        [INSTANT_TRADES_PROVIDER.UNISWAP_V2]: this.uniswapV2Service,
        [INSTANT_TRADES_PROVIDER.UNISWAP_V3]: this.uniswapV3Service,
        [INSTANT_TRADES_PROVIDER.SUSHISWAP]: this.sushiSwapEthService,
        [INSTANT_TRADES_PROVIDER.ZRX]: this.zrxService
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
      },
      [BLOCKCHAIN_NAME.AVALANCHE]: {
        [INSTANT_TRADES_PROVIDER.SUSHISWAP]: this.sushiSwapAvalancheService,
        [INSTANT_TRADES_PROVIDER.PANGOLIN]: this.pangolinAvalancheService,
        [INSTANT_TRADES_PROVIDER.JOE]: this.joeAvalancheService
      }
    };
  }

  public getEthAndWethTrade(): InstantTrade | null {
    const { fromAmount, fromToken, toToken, fromBlockchain } = this.swapFormService.inputValue;

    if (
      !fromToken ||
      !toToken ||
      !this.ethWethSwapProvider.isEthAndWethSwap(fromBlockchain, fromToken.address, toToken.address)
    ) {
      return null;
    }

    return {
      blockchain: fromBlockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: fromAmount
      }
    };
  }

  public async calculateTrades(
    providersNames: INSTANT_TRADES_PROVIDER[]
  ): Promise<PromiseSettledResult<InstantTrade>[]> {
    const { fromAmount, fromToken, toToken, fromBlockchain } = this.swapFormService.inputValue;

    const shouldCalculateGas =
      shouldCalculateGasInBlockchain[fromBlockchain as keyof typeof shouldCalculateGasInBlockchain];

    const providers = providersNames.map(
      providerName => this.blockchainsProviders[fromBlockchain][providerName]
    );
    const providersDataPromises = providers.map(async (provider: ItProvider) =>
      provider.calculateTrade(fromToken, fromAmount, toToken, shouldCalculateGas)
    );
    return Promise.allSettled(providersDataPromises);
  }

  public async createTrade(
    provider: INSTANT_TRADES_PROVIDER,
    trade: InstantTrade,
    confirmCallback?: () => void
  ): Promise<void> {
    let transactionHash: string;
    try {
      const options = {
        onConfirm: async (hash: string) => {
          confirmCallback();
          this.notifyTradeInProgress();

          // Inform gtm that tx was signed
          this.window.dataLayer?.push({
            event: 'transactionSigned',
            ecategory: ' transaction',
            eaction: 'ok',
            elabel: '',
            evalue: '',
            transaction: true,
            interactionType: false
          });

          await this.postTrade(hash, provider, trade);
          transactionHash = hash;
        }
      };

      let receipt;
      if (provider === INSTANT_TRADES_PROVIDER.WRAPPED) {
        receipt = await this.ethWethSwapProvider.createTrade(trade, options);
      } else {
        receipt = await this.blockchainsProviders[trade.blockchain][provider].createTrade(
          trade,
          options
        );
      }

      this.modalSubscriptions.pop()?.unsubscribe();
      this.updateTrade(transactionHash, true);
      this.notificationsService.show(new PolymorpheusComponent(SuccessTrxNotificationComponent), {
        status: TuiNotification.Success,
        autoClose: 15000
      });

      await this.instantTradesApiService
        .notifyInstantTradesBot({
          provider,
          blockchain: trade.blockchain,
          walletAddress: receipt.from,
          trade,
          txHash: transactionHash
        })
        .catch(_err => {});
    } catch (err) {
      this.modalSubscriptions.pop()?.unsubscribe();

      if (transactionHash && this.isTransactionCancelled(err)) {
        this.updateTrade(transactionHash, false);
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
        ),
        catchError(err => of(new CustomError(err.message)))
      )
      .subscribe();
  }

  /**
   * Checks if transaction is `cancelled` or `pending`.
   * @param err Error thrown during creating transaction.
   */
  private isTransactionCancelled(err: Error): boolean {
    return !err.message.includes(
      'Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!'
    );
  }

  /**
   * Calls api service method to update transaction's status.
   * @param hash Transaction's hash.
   * @param success If true status is `completed`, otherwise `cancelled`.
   */
  private updateTrade(hash: string, success: boolean) {
    return this.instantTradesApiService.patchTrade(hash, success).subscribe({
      error: err => console.debug('IT patch request is failed', err)
    });
  }

  public getAllowance(providersNames: INSTANT_TRADES_PROVIDER[]): Observable<boolean[]> | never {
    const { fromToken, fromAmount, fromBlockchain } = this.swapFormService.inputValue;
    const providers = providersNames.map(
      providerName => this.blockchainsProviders[fromBlockchain][providerName]
    );
    const providerApproveData = providers.map((provider: ItProvider) =>
      provider.getAllowance(fromToken.address).pipe(
        catchError(err => {
          console.debug(err, provider);
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
            this.modalSubscriptions.push(
              this.notificationsService.show(
                this.translateService.instant('notifications.approveInProgress'),
                {
                  status: TuiNotification.Info,
                  autoClose: false
                }
              )
            );
          }
        }
      );
      this.modalSubscriptions.pop()?.unsubscribe();
      this.notificationsService.show(
        this.translateService.instant('notifications.successApprove'),
        {
          status: TuiNotification.Success,
          autoClose: 15000
        }
      );
    } catch (err) {
      this.modalSubscriptions.pop()?.unsubscribe();
      throw err;
    }
  }

  private notifyTradeInProgress() {
    this.modalSubscriptions.push(
      this.notificationsService.show(
        this.translateService.instant('notifications.tradeInProgress'),
        {
          status: TuiNotification.Info,
          autoClose: false
        }
      )
    );

    if (this.window.location.pathname === '/') {
      this.successTxModalService.open();
    }
  }
}

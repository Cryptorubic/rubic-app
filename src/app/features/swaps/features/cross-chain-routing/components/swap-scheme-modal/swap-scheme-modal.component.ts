import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { Provider, TRADES_PROVIDERS } from '@app/shared/constants/common/trades-providers';
import { TuiDialogContext, TuiNotification } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { Blockchain, BLOCKCHAINS } from '@app/shared/constants/blockchain/ui-blockchains';
import { ThemeService } from '@app/core/services/theme/theme.service';
import {
  catchError,
  filter,
  map,
  retry,
  startWith,
  switchMap,
  takeWhile,
  tap
} from 'rxjs/operators';
import {
  BehaviorSubject,
  from,
  interval,
  Observable,
  delay,
  Subscription,
  of,
  takeUntil
} from 'rxjs';
import { TransactionReceipt } from 'web3-eth';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { CROSS_CHAIN_PROD } from 'src/environments/constants/cross-chain';
import { CelerSwapStatus } from '../../services/cross-chain-routing-service/celer/models/celer-swap-status.enum';
import { decodeLogs } from '@app/shared/utils/decode-logs';
import { TransactionStuckError } from 'symbiosis-js-sdk';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { RubicSwapStatus } from '@app/shared/models/swaps/rubic-swap-status.enum';
import { PROCESSED_TRANSACTION_METHOD_ABI } from '@app/shared/constants/common/processed-transaction-method-abi';
import { HeaderStore } from '@app/core/header/services/header.store';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { RecentTradeStatus } from '@app/core/recent-trades/models/recent-trade-status.enum';
import { SwapSchemeModalData } from '../../models/swap-scheme-modal-data.interface';
import { CommonModalService } from '@app/core/services/modal/common-modal.service';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  Web3Public
} from 'rubic-sdk';
import { celerContractAbi } from '@core/recent-trades/constants/celer-contract-abi';
import { celerContract } from '@core/recent-trades/constants/celer-contract-addresses';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';

enum MODAL_SWAP_STATUS {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAIL = 'FAIL',
  UNKNOWN = 'UNKNOWN',
  REVERT = 'REVERT'
}

@Component({
  selector: 'app-swap-scheme-modal',
  templateUrl: './swap-scheme-modal.component.html',
  styleUrls: ['./swap-scheme-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapSchemeModalComponent implements OnInit {
  public trade: SwapSchemeModalData;

  public srcProvider: Provider;

  public dstProvider: Provider;

  public fromToken: TokenAmount;

  public toToken: TokenAmount;

  public fromBlockchain: Blockchain;

  public toBlockchain: Blockchain;

  public crossChainProvider: CrossChainTradeType;

  private srcTxHash: string;

  private srcTxReceipt: TransactionReceipt;

  private srcWeb3Public: Web3Public;

  private dstWeb3Public: Web3Public;

  private readonly _srcTxStatus$ = new BehaviorSubject<MODAL_SWAP_STATUS>(
    MODAL_SWAP_STATUS.PENDING
  );

  public readonly srcTxStatus$ = this._srcTxStatus$.asObservable();

  private readonly _dstTxStatus$ = new BehaviorSubject<MODAL_SWAP_STATUS>(
    MODAL_SWAP_STATUS.UNKNOWN
  );

  public readonly dstTxStatus$ = this._dstTxStatus$.asObservable();

  private readonly _tradeProcessingStatus$ = new BehaviorSubject<MODAL_SWAP_STATUS>(
    MODAL_SWAP_STATUS.UNKNOWN
  );

  public readonly tradeProcessingStatus$ = this._tradeProcessingStatus$.asObservable();

  public readonly MODAL_SWAP_STATUS = MODAL_SWAP_STATUS;

  private readonly _revertBtnLoading$ = new BehaviorSubject<boolean>(false);

  public readonly revertBtnLoading$ = this._revertBtnLoading$.asObservable();

  public readonly isDarkTheme$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly errorService: ErrorsService,
    private readonly notificationService: NotificationsService,
    private readonly themeService: ThemeService,
    private readonly translateService: TranslateService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly commonModalService: CommonModalService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, SwapSchemeModalData>,
    @Inject(TuiDestroyService) private readonly destroy$: TuiDestroyService,
    private readonly sdk: RubicSdkService
  ) {
    this.setTradeData(this.context.data);
  }

  ngOnInit(): void {
    this.initSrcTxStatusPolling();
    this.initTradeProcessingStatusPolling();
    this.initDstTxStatusPolling();
  }

  public initSrcTxStatusPolling(): void {
    interval(5000)
      .pipe(
        delay(new Date(Date.now() + 2000)),
        startWith(-1),
        switchMap(() => {
          return from(this.getSourceTxStatus(this.srcTxHash));
        }),
        tap(srcTxStatus => this._srcTxStatus$.next(srcTxStatus)),
        takeWhile(srcTxStatus => srcTxStatus === MODAL_SWAP_STATUS.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public initTradeProcessingStatusPolling(): void {
    this.srcTxStatus$
      .pipe(
        filter(srcTxStatus => srcTxStatus === MODAL_SWAP_STATUS.SUCCESS),
        tap(() => this._tradeProcessingStatus$.next(MODAL_SWAP_STATUS.PENDING)),
        switchMap(() => {
          return interval(7000).pipe(
            startWith(-1),
            switchMap(() => {
              return from(this.srcWeb3Public.getBlockNumber()).pipe(
                map(currentBlockNumber => {
                  const diff = this.fromBlockchain.key === BLOCKCHAIN_NAME.ETHEREUM ? 5 : 10;

                  return currentBlockNumber - this.srcTxReceipt.blockNumber > diff
                    ? MODAL_SWAP_STATUS.SUCCESS
                    : MODAL_SWAP_STATUS.PENDING;
                })
              );
            }),
            catchError((error: unknown) => {
              console.debug('[General] error getting current block number', error);
              return of(MODAL_SWAP_STATUS.PENDING);
            }),
            tap(tradeProcessingStatus => this._tradeProcessingStatus$.next(tradeProcessingStatus))
          );
        }),
        takeWhile(tradeProcessingStatus => tradeProcessingStatus === MODAL_SWAP_STATUS.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public initDstTxStatusPolling(): void {
    this.tradeProcessingStatus$
      .pipe(
        filter(tradeProcessingStatus => tradeProcessingStatus === MODAL_SWAP_STATUS.SUCCESS),
        tap(() => this._dstTxStatus$.next(MODAL_SWAP_STATUS.PENDING)),
        switchMap(() => {
          // TODO move switchMap callback to fabric
          if (this.crossChainProvider === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS) {
            return this.getSymbiosisDstTxStatus();
          }

          return interval(10000).pipe(
            startWith(-1),
            switchMap(() => {
              if (this.crossChainProvider === CROSS_CHAIN_TRADE_TYPE.RUBIC) {
                return this.getRubicDstTxStatus();
              }

              if (this.crossChainProvider === CROSS_CHAIN_TRADE_TYPE.CELER) {
                return this.getCelerDstTxStatus();
              }
            })
          );
        }),
        tap(dstTxStatus => {
          this._dstTxStatus$.next(dstTxStatus);
        }),
        takeWhile(dstTxStatus => dstTxStatus === MODAL_SWAP_STATUS.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private async getCelerDstTxStatus(): Promise<MODAL_SWAP_STATUS> {
    try {
      const srcTransactionReceipt = await this.srcWeb3Public.getTransactionReceipt(this.srcTxHash);
      const [requestLog] = decodeLogs(celerContractAbi, srcTransactionReceipt).filter(Boolean); // filter undecoded logs
      const dstTransactionStatus = Number(
        await this.dstWeb3Public.callContractMethod(
          celerContract[this.toBlockchain.key],
          celerContractAbi,
          'txStatusById',
          {
            methodArguments: [requestLog.params.find(param => param.name === 'id').value]
          }
        )
      ) as CelerSwapStatus;

      if (dstTransactionStatus === CelerSwapStatus.NULL) {
        return MODAL_SWAP_STATUS.PENDING;
      }

      if (dstTransactionStatus === CelerSwapStatus.FAILED) {
        return MODAL_SWAP_STATUS.FAIL;
      }

      if (dstTransactionStatus === CelerSwapStatus.SUCСESS) {
        return MODAL_SWAP_STATUS.SUCCESS;
      }
    } catch (error) {
      console.debug('[Celer] error retrieving dst tx status: ', error);
      return MODAL_SWAP_STATUS.PENDING;
    }
  }

  private async getRubicDstTxStatus(): Promise<MODAL_SWAP_STATUS> {
    try {
      const statusTo = Number(
        await this.dstWeb3Public.callContractMethod(
          CROSS_CHAIN_PROD.contractAddresses[this.toBlockchain.key],
          PROCESSED_TRANSACTION_METHOD_ABI,
          'processedTransactions',
          { methodArguments: [this.srcTxHash] }
        )
      );

      if (statusTo === RubicSwapStatus.NULL) {
        return MODAL_SWAP_STATUS.PENDING;
      }

      if (statusTo === RubicSwapStatus.PROCESSED) {
        return MODAL_SWAP_STATUS.SUCCESS;
      }

      if (statusTo === RubicSwapStatus.REVERTED) {
        return MODAL_SWAP_STATUS.FAIL;
      }
    } catch (error) {
      console.debug('[Rubic] error retrieving dst tx status: ', error);
      return MODAL_SWAP_STATUS.PENDING;
    }
  }

  private getSymbiosisDstTxStatus(): Observable<MODAL_SWAP_STATUS> {
    return from(
      this.sdk.symbiosis.waitForComplete(
        this.fromBlockchain.key,
        this.toBlockchain.key,
        this.toToken,
        this.srcTxReceipt
      )
    ).pipe(
      retry(3),
      map(response => {
        console.debug('[Symbiosis] cross-chain completed: ', response);

        if (response) {
          return MODAL_SWAP_STATUS.SUCCESS;
        }

        return MODAL_SWAP_STATUS.PENDING;
      }),
      catchError((error: unknown) => {
        console.debug('[Symbiosis] error retrieving dst tx status: ', error);

        if (error instanceof TransactionStuckError) {
          return of(MODAL_SWAP_STATUS.REVERT);
        }

        return of(MODAL_SWAP_STATUS.PENDING);
      })
    );
  }

  // TODO move method to fabric
  private async getSourceTxStatus(txHash: string): Promise<MODAL_SWAP_STATUS> {
    try {
      this.srcTxReceipt = await this.srcWeb3Public.getTransactionReceipt(txHash);
    } catch (error) {
      console.debug('[General] error retrieving src tx status', { error, txHash });
      this.srcTxReceipt = null;
    }

    if (this.srcTxReceipt === null) {
      return MODAL_SWAP_STATUS.PENDING;
    }

    return this.srcTxReceipt.status ? MODAL_SWAP_STATUS.SUCCESS : MODAL_SWAP_STATUS.FAIL;
  }

  public async revertSymbiosisTrade(): Promise<void> {
    let tradeInProgressSubscription$: Subscription;
    const onTransactionHash = () => {
      tradeInProgressSubscription$ = this.notificationService.show(
        this.translateService.instant('bridgePage.progressMessage'),
        {
          label: this.translateService.instant('notifications.tradeInProgress'),
          status: TuiNotification.Info,
          autoClose: false
        }
      );
    };

    this._revertBtnLoading$.next(true);

    try {
      await this.sdk.symbiosis.revertTrade(this.srcTxHash, onTransactionHash);

      tradeInProgressSubscription$.unsubscribe();
      this.notificationService.show(this.translateService.instant('bridgePage.successMessage'), {
        label: this.translateService.instant('notifications.successfulTradeTitle'),
        status: TuiNotification.Success,
        autoClose: 15000
      });

      this.recentTradesStoreService.updateTrade({
        ...this.recentTradesStoreService.getSpecificTrade(this.srcTxHash, this.fromBlockchain.key),
        calculatedStatusFrom: RecentTradeStatus.SUCCESS,
        calculatedStatusTo: RecentTradeStatus.FALLBACK
      });

      this.context.completeWith(true);
    } catch (err) {
      this.errorService.catch(err);
    } finally {
      this._revertBtnLoading$.next(false);
      tradeInProgressSubscription$?.unsubscribe();
    }
  }

  public closeModalAndOpenMyTrades(): void {
    this.context.completeWith(false);

    this.commonModalService
      .openRecentTradesModal({
        size: this.headerStore.isMobile ? 'page' : ('xl' as 'l') // hack for custom modal size
      })
      .subscribe();
  }

  private setTradeData(data: SwapSchemeModalData): void {
    this.srcProvider = TRADES_PROVIDERS[data.srcProvider];
    this.dstProvider = TRADES_PROVIDERS[data.dstProvider];

    this.fromBlockchain = BLOCKCHAINS[data.fromBlockchain];
    this.toBlockchain = BLOCKCHAINS[data.toBlockchain];

    this.fromToken = data.fromToken;
    this.toToken = data.toToken;

    this.srcTxHash = data.srcTxHash;

    this.crossChainProvider = data.crossChainProvider;

    this.srcWeb3Public = this.getWeb3Public(data.fromBlockchain);

    this.dstWeb3Public = this.getWeb3Public(data.toBlockchain);
  }

  private getWeb3Public(blockchain: BlockchainName): Web3Public {
    return Injector.web3PublicService.getWeb3Public(blockchain);
  }
}

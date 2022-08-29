import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { Provider } from '@app/shared/constants/common/trades-providers';
import { TuiDialogContext, TuiNotification } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { Blockchain, BLOCKCHAINS } from '@app/shared/constants/blockchain/ui-blockchains';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { catchError, filter, map, startWith, switchMap, takeWhile, tap } from 'rxjs/operators';
import {
  BehaviorSubject,
  from,
  interval,
  delay,
  Subscription,
  of,
  takeUntil,
  forkJoin
} from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { SwapSchemeModalData } from '../../models/swap-scheme-modal-data.interface';
import { CommonModalService } from '@app/core/services/modal/common-modal.service';
import { BLOCKCHAIN_NAME, CrossChainTradeType, Web3Public, CrossChainTxStatus } from 'rubic-sdk';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';

@Component({
  selector: 'polymorpheus-swap-scheme-modal',
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

  private srcWeb3Public: Web3Public;

  private readonly _srcTxStatus$ = new BehaviorSubject<CrossChainTxStatus>(
    CrossChainTxStatus.PENDING
  );

  public readonly srcTxStatus$ = this._srcTxStatus$.asObservable();

  private readonly _dstTxStatus$ = new BehaviorSubject<CrossChainTxStatus>(
    CrossChainTxStatus.UNKNOWN
  );

  public readonly dstTxStatus$ = this._dstTxStatus$.asObservable();

  private readonly _tradeProcessingStatus$ = new BehaviorSubject<CrossChainTxStatus>(
    CrossChainTxStatus.UNKNOWN
  );

  public readonly tradeProcessingStatus$ = this._tradeProcessingStatus$.asObservable();

  public readonly CrossChainTxStatus = CrossChainTxStatus;

  private readonly _revertBtnLoading$ = new BehaviorSubject<boolean>(false);

  public readonly revertBtnLoading$ = this._revertBtnLoading$.asObservable();

  public readonly isDarkTheme$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));

  public bridgeType: Provider;

  public viaUuid: string | undefined;

  public rangoRequestId: string | undefined;

  private timestamp: number;

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
          return from(
            this.sdk.crossChainStatusManager.getCrossChainStatus(
              {
                fromBlockchain: this.fromBlockchain.key,
                toBlockchain: this.toBlockchain.key,
                srcTxHash: this.srcTxHash,
                txTimestamp: this.timestamp,
                lifiBridgeType: this.bridgeType.name,
                viaUuid: this.viaUuid,
                rangoRequestId: this.rangoRequestId
              },
              this.crossChainProvider
            )
          );
        }),
        tap(crossChainStatus => this._srcTxStatus$.next(crossChainStatus.srcTxStatus)),
        takeWhile(crossChainStatus => crossChainStatus.srcTxStatus === CrossChainTxStatus.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public initTradeProcessingStatusPolling(): void {
    this.srcTxStatus$
      .pipe(
        filter(srcTxStatus => srcTxStatus === CrossChainTxStatus.SUCCESS),
        tap(() => this._tradeProcessingStatus$.next(CrossChainTxStatus.PENDING)),
        switchMap(() => {
          return interval(7000).pipe(
            startWith(-1),
            switchMap(() => {
              return forkJoin([
                this.srcWeb3Public.getBlockNumber(),
                this.srcWeb3Public.getTransactionReceipt(this.srcTxHash)
              ]).pipe(
                map(([currentBlockNumber, srcTxReceipt]) => {
                  const diff = this.fromBlockchain.key === BLOCKCHAIN_NAME.ETHEREUM ? 5 : 10;

                  return currentBlockNumber - srcTxReceipt.blockNumber > diff
                    ? CrossChainTxStatus.SUCCESS
                    : CrossChainTxStatus.PENDING;
                })
              );
            }),
            catchError((error: unknown) => {
              console.debug('[General] error getting current block number', error);
              return of(CrossChainTxStatus.PENDING);
            }),
            tap(tradeProcessingStatus => this._tradeProcessingStatus$.next(tradeProcessingStatus))
          );
        }),
        takeWhile(tradeProcessingStatus => tradeProcessingStatus === CrossChainTxStatus.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public initDstTxStatusPolling(): void {
    this.tradeProcessingStatus$
      .pipe(
        filter(tradeProcessingStatus => tradeProcessingStatus === CrossChainTxStatus.SUCCESS),
        tap(() => this._dstTxStatus$.next(CrossChainTxStatus.PENDING)),
        switchMap(() => {
          return interval(10000).pipe(
            startWith(-1),
            switchMap(() =>
              from(
                this.sdk.crossChainStatusManager.getCrossChainStatus(
                  {
                    fromBlockchain: this.fromBlockchain.key,
                    toBlockchain: this.toBlockchain.key,
                    srcTxHash: this.srcTxHash,
                    txTimestamp: this.timestamp,
                    lifiBridgeType: this.bridgeType.name.toLowerCase(),
                    viaUuid: this.viaUuid,
                    rangoRequestId: this.rangoRequestId
                  },
                  this.crossChainProvider
                )
              )
            )
          );
        }),
        tap(crossChainStatus => {
          this._dstTxStatus$.next(crossChainStatus.dstTxStatus);
        }),
        takeWhile(crossChainStatus => crossChainStatus.dstTxStatus === CrossChainTxStatus.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
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
      await this.sdk.symbiosis.revertTrade(this.srcTxHash, { onConfirm: onTransactionHash });

      tradeInProgressSubscription$.unsubscribe();
      this.notificationService.show(this.translateService.instant('bridgePage.successMessage'), {
        label: this.translateService.instant('notifications.successfulTradeTitle'),
        status: TuiNotification.Success,
        autoClose: 15000
      });

      this.recentTradesStoreService.updateTrade({
        ...this.recentTradesStoreService.getSpecificTrade(this.srcTxHash, this.fromBlockchain.key),
        calculatedStatusFrom: CrossChainTxStatus.SUCCESS,
        calculatedStatusTo: CrossChainTxStatus.FALLBACK
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
    this.srcProvider = data.srcProvider;
    this.dstProvider = data.dstProvider;

    this.fromBlockchain = BLOCKCHAINS[data.fromBlockchain];
    this.toBlockchain = BLOCKCHAINS[data.toBlockchain];

    this.fromToken = data.fromToken;
    this.toToken = data.toToken;

    this.srcTxHash = data.srcTxHash;

    this.crossChainProvider = data.crossChainProvider;

    this.srcWeb3Public = Injector.web3PublicService.getWeb3Public(data.fromBlockchain);

    this.bridgeType = data.bridgeType;

    this.viaUuid = data.viaUuid;
    this.rangoRequestId = data.rangoRequestId;

    this.timestamp = data.timestamp;
  }
}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Self
} from '@angular/core';
import { TuiDialogContext, TuiNotification } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { catchError, filter, map, startWith, switchMap, takeWhile, tap } from 'rxjs/operators';
import {
  BehaviorSubject,
  delay,
  forkJoin,
  from,
  interval,
  of,
  Subscription,
  takeUntil
} from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { SwapSchemeModalData } from '../../models/swap-scheme-modal-data.interface';
import { ModalService } from '@app/core/modals/services/modal.service';
import {
  BLOCKCHAIN_NAME,
  CbridgeCrossChainSupportedBlockchain,
  CrossChainCbridgeManager,
  CrossChainTradeType,
  EvmWeb3Public,
  Injector,
  TronWeb3Public,
  TX_STATUS,
  TxStatus,
  Web3Public,
  Web3PublicSupportedBlockchain
} from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';
import { CROSS_CHAIN_TRADE_TYPE } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { Blockchain, BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { Router } from '@angular/router';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/models/tradeHistory';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';

@Component({
  selector: 'polymorpheus-swap-scheme-modal',
  templateUrl: './swap-scheme-modal.component.html',
  styleUrls: ['./swap-scheme-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapSchemeModalComponent implements OnInit, AfterViewInit, OnDestroy {
  public trade: SwapSchemeModalData;

  public srcProvider: ProviderInfo;

  public dstProvider: ProviderInfo;

  public fromToken: TokenAmount;

  public toToken: TokenAmount;

  public fromBlockchain: Blockchain;

  public toBlockchain: Blockchain;

  public crossChainProvider: CrossChainTradeType;

  private srcTxHash: string;

  private srcWeb3Public: Web3Public;

  private readonly _srcTxStatus$ = new BehaviorSubject<TxStatus>(TX_STATUS.PENDING);

  public readonly srcTxStatus$ = this._srcTxStatus$.asObservable();

  private readonly _dstTxStatus$ = new BehaviorSubject<TxStatus>(TX_STATUS.UNKNOWN);

  public readonly dstTxStatus$ = this._dstTxStatus$.asObservable();

  private readonly _tradeProcessingStatus$ = new BehaviorSubject<TxStatus>(TX_STATUS.UNKNOWN);

  public readonly tradeProcessingStatus$ = this._tradeProcessingStatus$.asObservable();

  public readonly CrossChainTxStatus = TX_STATUS;

  private readonly _revertBtnLoading$ = new BehaviorSubject<boolean>(false);

  public readonly revertBtnLoading$ = this._revertBtnLoading$.asObservable();

  public readonly isDarkTheme$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));

  public bridgeType: ProviderInfo;

  public viaUuid: string | undefined;

  public rangoRequestId: string | undefined;

  private timestamp: number;

  private amountOutMin: string;

  private changenowId: string;

  public hideUnusedUI: boolean = this.queryParamsService.hideUnusedUI;

  public points: number = 0;

  public get isArbitrumBridge(): boolean {
    return (
      this.fromBlockchain.key === BLOCKCHAIN_NAME.ARBITRUM &&
      this.toBlockchain.key === BLOCKCHAIN_NAME.ETHEREUM &&
      this.crossChainProvider === CROSS_CHAIN_TRADE_TYPE.ARBITRUM
    );
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly errorService: ErrorsService,
    private readonly notificationService: NotificationsService,
    private readonly themeService: ThemeService,
    private readonly translateService: TranslateService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly modalService: ModalService,
    private readonly queryParamsService: QueryParamsService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, SwapSchemeModalData>,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly sdkService: SdkService,
    private readonly router: Router,
    private readonly swapAndEarnStateService: SwapAndEarnStateService
  ) {
    this.setTradeData(this.context.data);
  }

  ngOnInit(): void {
    this.initSrcTxStatusPolling();
    this.initTradeProcessingStatusPolling();
    this.initDstTxStatusPolling();
  }

  ngAfterViewInit(): void {
    if (this.points && this.points > 0) {
      SwapSchemeModalComponent.toggleConfettiBackground('show');
    }
  }

  ngOnDestroy(): void {
    this.swapAndEarnStateService.updatePoints();
    SwapSchemeModalComponent.toggleConfettiBackground('remove');
  }

  private static toggleConfettiBackground(action: 'show' | 'remove'): void {
    const overlay = document.querySelector('.t-overlay');

    if (action === 'show') {
      overlay.classList.add('t-overlay-ccr-confetti');
    }

    if (action === 'remove') {
      overlay.classList.remove('t-overlay-ccr-confetti');
    }
  }

  public initSrcTxStatusPolling(): void {
    interval(5000)
      .pipe(
        delay(new Date(Date.now() + 2000)),
        startWith(-1),
        switchMap(() => {
          return from(
            this.sdkService.crossChainStatusManager.getCrossChainStatus(
              {
                fromBlockchain: this.fromToken.blockchain as Web3PublicSupportedBlockchain,
                toBlockchain: this.toToken.blockchain,
                srcTxHash: this.srcTxHash,
                txTimestamp: this.timestamp,
                lifiBridgeType: this.bridgeType.name,
                viaUuid: this.viaUuid,
                rangoRequestId: this.rangoRequestId,
                amountOutMin: this.amountOutMin,
                changenowId: this.changenowId
              },
              this.crossChainProvider
            )
          );
        }),
        catchError(() =>
          of({ srcTxStatus: TX_STATUS.PENDING, dstTxStatus: TX_STATUS.PENDING, dstTxHash: null })
        ),
        tap(crossChainStatus => {
          const storageData = this.recentTradesStoreService.getSpecificCrossChainTrade(
            this.srcTxHash,
            this.fromBlockchain.key
          );
          const status =
            storageData?.calculatedStatusFrom === TX_STATUS.SUCCESS
              ? TX_STATUS.SUCCESS
              : crossChainStatus.srcTxStatus;

          this._srcTxStatus$.next(status);
        }),
        takeWhile(crossChainStatus => crossChainStatus.srcTxStatus === TX_STATUS.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public initTradeProcessingStatusPolling(): void {
    this.srcTxStatus$
      .pipe(
        filter(srcTxStatus => srcTxStatus === TX_STATUS.SUCCESS),
        tap(() => this._tradeProcessingStatus$.next(TX_STATUS.PENDING)),
        switchMap(() => {
          return interval(7000).pipe(
            startWith(-1),
            switchMap(() => {
              // @todo move function to sdk
              const getTransaction =
                this.srcWeb3Public instanceof EvmWeb3Public
                  ? this.srcWeb3Public.getTransactionReceipt
                  : (this.srcWeb3Public as TronWeb3Public).getTransactionInfo;

              return forkJoin([
                this.srcWeb3Public.getBlockNumber(),
                getTransaction(this.srcTxHash)
              ]).pipe(
                map(([currentBlockNumber, srcTxReceipt]) => {
                  const diff =
                    this.fromToken.blockchain === BLOCKCHAIN_NAME.ETHEREUM
                      ? 5
                      : this.fromToken.blockchain === BLOCKCHAIN_NAME.TRON
                      ? 20
                      : 10;

                  return currentBlockNumber - srcTxReceipt.blockNumber > diff
                    ? TX_STATUS.SUCCESS
                    : TX_STATUS.PENDING;
                }),
                catchError((error: unknown) => {
                  console.debug('[General] error getting current block number', error);
                  return of(TX_STATUS.PENDING);
                })
              );
            }),
            tap(tradeProcessingStatus => this._tradeProcessingStatus$.next(tradeProcessingStatus))
          );
        }),
        takeWhile(tradeProcessingStatus => tradeProcessingStatus === TX_STATUS.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public initDstTxStatusPolling(): void {
    this.tradeProcessingStatus$
      .pipe(
        filter(tradeProcessingStatus => tradeProcessingStatus === TX_STATUS.SUCCESS),
        tap(() => this._dstTxStatus$.next(TX_STATUS.PENDING)),
        switchMap(() => {
          return interval(30_000).pipe(
            startWith(-1),
            switchMap(() =>
              from(
                this.sdkService.crossChainStatusManager.getCrossChainStatus(
                  {
                    fromBlockchain: this.fromToken.blockchain as Web3PublicSupportedBlockchain,
                    toBlockchain: this.toToken.blockchain,
                    srcTxHash: this.srcTxHash,
                    txTimestamp: this.timestamp,
                    lifiBridgeType: this.bridgeType.name.toLowerCase(),
                    viaUuid: this.viaUuid,
                    rangoRequestId: this.rangoRequestId,
                    amountOutMin: this.amountOutMin,
                    changenowId: this.changenowId
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
        takeWhile(crossChainStatus => crossChainStatus.dstTxStatus === TX_STATUS.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public async revertTrade(): Promise<void> {
    let tradeInProgressSubscription$: Subscription;
    const onTransactionHash = () => {
      tradeInProgressSubscription$ = this.notificationService.show(
        this.translateService.instant('bridgePage.progressMessage'),
        {
          label: this.translateService.instant('notifications.tradeInProgress'),
          status: TuiNotification.Info,
          autoClose: false,
          data: null
        }
      );
    };

    this._revertBtnLoading$.next(true);

    try {
      if (this.crossChainProvider === CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE) {
        await CrossChainCbridgeManager.makeRefund(
          this.fromBlockchain.key as CbridgeCrossChainSupportedBlockchain,
          this.srcTxHash,
          this.amountOutMin,
          onTransactionHash
        );
      }
      if (this.crossChainProvider === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS) {
        await this.sdkService.symbiosis.revertTrade(this.srcTxHash, {
          onConfirm: onTransactionHash
        });
      }

      tradeInProgressSubscription$.unsubscribe();
      this.notificationService.show(this.translateService.instant('bridgePage.successMessage'), {
        label: this.translateService.instant('notifications.successfulTradeTitle'),
        status: TuiNotification.Success,
        autoClose: 15000,
        data: null
      });

      this.recentTradesStoreService.updateTrade({
        ...this.recentTradesStoreService.getSpecificCrossChainTrade(
          this.srcTxHash,
          this.fromToken.blockchain
        ),
        calculatedStatusFrom: TX_STATUS.SUCCESS,
        calculatedStatusTo: TX_STATUS.FALLBACK
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

    if (this.headerStore.isMobile) {
      this.modalService.openUserProfile(TradesHistory.CROSS_CHAIN).subscribe();
    } else {
      this.modalService
        .openRecentTradesModal({
          size: 'xl' as 'l' // hack for custom modal size
        })
        .subscribe();
    }
  }

  private setTradeData(data: SwapSchemeModalData): void {
    this.points = data.points;

    this.srcProvider = data.srcProvider;
    this.dstProvider = data.dstProvider;

    this.fromToken = data.fromToken;
    this.toToken = data.toToken;

    this.fromBlockchain = BLOCKCHAINS[this.fromToken.blockchain];
    this.toBlockchain = BLOCKCHAINS[this.toToken.blockchain];

    this.srcTxHash = data.srcTxHash;

    this.crossChainProvider = data.crossChainProvider;

    this.srcWeb3Public = Injector.web3PublicService.getWeb3Public(data.fromToken.blockchain);

    this.bridgeType = data.bridgeType;

    this.viaUuid = data.viaUuid;
    this.rangoRequestId = data.rangoRequestId;

    this.timestamp = data.timestamp;

    this.amountOutMin = data.amountOutMin;
    this.changenowId = data.changenowId;
  }

  public async navigateToSwapAndEarn(): Promise<void> {
    this.context.completeWith(false);

    await this.router.navigateByUrl(ROUTE_PATH.SWAP_AND_EARN);
  }
}

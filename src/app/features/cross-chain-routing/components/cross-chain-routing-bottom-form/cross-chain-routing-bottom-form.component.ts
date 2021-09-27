import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { BehaviorSubject, forkJoin, of, Subject, Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import {
  catchError,
  distinctUntilChanged,
  filter,
  first,
  map,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import { TransactionReceipt } from 'web3-eth';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { CounterNotificationsService } from 'src/app/core/services/counter-notifications/counter-notifications.service';
import { CrossChainRoutingService } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { REFRESH_BUTTON_STATUS } from 'src/app/shared/components/rubic-refresh-button/rubic-refresh-button.component';
import { SuccessTrxNotificationComponent } from 'src/app/shared/components/success-trx-notification/success-trx-notification.component';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { WINDOW } from '@ng-web-apis/common';
import { SuccessTxModalService } from 'src/app/features/swaps/services/success-tx-modal-service/success-tx-modal.service';
import { SwapFormService } from '../../../swaps/services/swaps-form-service/swap-form.service';

interface BlockchainInfo {
  name: string;
  href: string;
}

const BLOCKCHAINS_INFO: { [key in BLOCKCHAIN_NAME]?: BlockchainInfo } = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    name: 'Binance Smart Chain',
    href: 'https://www.binance.org/'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    name: 'Polygon',
    href: 'https://polygon.technology/'
  }
};

type CalculateTradeType = 'normal' | 'hidden';

@Component({
  selector: 'app-cross-chain-routing-bottom-form',
  templateUrl: './cross-chain-routing-bottom-form.component.html',
  styleUrls: ['./cross-chain-routing-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CrossChainRoutingBottomFormComponent implements OnInit, OnDestroy {
  @Input() onRefreshTrade: Subject<void>;

  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Output() onRefreshStatusChange = new EventEmitter<REFRESH_BUTTON_STATUS>();

  @Output() tradeStatusChange = new EventEmitter<TRADE_STATUS>();

  public readonly TRADE_STATUS = TRADE_STATUS;

  private readonly onCalculateTrade$: Subject<CalculateTradeType>;

  private hiddenTradeData$: BehaviorSubject<{
    toAmount: BigNumber;
  }>;

  public toBlockchain: BLOCKCHAIN_NAME;

  public fromAmount: BigNumber;

  public minError: false | BigNumber;

  public maxError: false | BigNumber;

  public toWalletAddress: string;

  public needApprove: boolean;

  private _tradeStatus: TRADE_STATUS;

  private toAmount: BigNumber;

  public errorText: string;

  public slippageTolerance: number;

  private calculateTradeSubscription$: Subscription;

  private hiddenCalculateTradeSubscription$: Subscription;

  private tradeInProgressSubscription$: Subscription;

  get tradeStatus(): TRADE_STATUS {
    return this._tradeStatus;
  }

  set tradeStatus(value: TRADE_STATUS) {
    this._tradeStatus = value;
    this.tradeStatusChange.emit(value);
  }

  get allowTrade(): boolean {
    const { fromBlockchain, toBlockchain, fromToken, toToken, fromAmount } =
      this.swapFormService.inputValue;
    return (
      fromBlockchain &&
      toBlockchain &&
      fromToken &&
      toToken &&
      fromAmount &&
      !fromAmount.isNaN() &&
      fromAmount.gt(0)
    );
  }

  get whatIsBlockchain(): BlockchainInfo {
    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;
    const nonEthBlockchain =
      toBlockchain === BLOCKCHAIN_NAME.ETHEREUM ? fromBlockchain : toBlockchain;
    return BLOCKCHAINS_INFO[nonEthBlockchain];
  }

  constructor(
    private errorsService: ErrorsService,
    public swapFormService: SwapFormService,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly translateService: TranslateService,
    private readonly tokensService: TokensService,
    private readonly notificationsService: NotificationsService,
    private readonly crossChainRoutingService: CrossChainRoutingService,
    private readonly counterNotificationsService: CounterNotificationsService,
    private readonly destroy$: TuiDestroyService,
    @Inject(WINDOW) private readonly window: Window,
    private readonly successTxModalService: SuccessTxModalService
  ) {
    this.onCalculateTrade$ = new Subject();
    this.hiddenTradeData$ = new BehaviorSubject(undefined);
  }

  ngOnInit() {
    this.setupTradeCalculation();
    this.setupHiddenCalculation();
    this.tradeStatus = TRADE_STATUS.DISABLED;

    this.swapFormService.inputValueChanges
      .pipe(
        startWith(this.swapFormService.inputValue),
        distinctUntilChanged((prev, next) => {
          return (
            prev.toBlockchain === next.toBlockchain &&
            prev.fromBlockchain === next.fromBlockchain &&
            prev.fromToken?.address === next.fromToken?.address &&
            prev.toToken?.address === next.toToken?.address &&
            prev.fromAmount === next.fromAmount
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(form => this.setFormValues(form));

    this.settingsService.crossChainRoutingValueChanges
      .pipe(startWith(this.settingsService.crossChainRoutingValue), takeUntil(this.destroy$))
      .subscribe(settings => {
        this.slippageTolerance = settings.slippageTolerance;
      });

    this.authService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.toWalletAddress = user?.address;
      });

    this.onRefreshTrade.pipe(takeUntil(this.destroy$)).subscribe(() => this.conditionalCalculate());
  }

  ngOnDestroy() {
    this.calculateTradeSubscription$.unsubscribe();
    this.hiddenCalculateTradeSubscription$.unsubscribe();
  }

  private setFormValues(form: SwapFormInput): void {
    this.toBlockchain = form.toBlockchain;
    this.fromAmount = form.fromAmount;
    this.cdr.detectChanges();

    this.conditionalCalculate('normal');
  }

  private async conditionalCalculate(type?: CalculateTradeType): Promise<void> {
    const { fromToken, toToken } = this.swapFormService.inputValue;
    if (!fromToken?.address || !toToken?.address) {
      this.maxError = false;
      this.minError = false;
      this.errorText = '';
    }

    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;
    if (fromBlockchain === toBlockchain) {
      return;
    }

    if (!this.allowTrade) {
      this.tradeStatus = TRADE_STATUS.DISABLED;
      this.swapFormService.output.patchValue({
        toAmount: new BigNumber(NaN)
      });
      this.cdr.detectChanges();
      return;
    }

    const { autoRefresh } = this.settingsService.crossChainRoutingValue;
    this.onCalculateTrade$.next(type || (autoRefresh ? 'normal' : 'hidden'));
  }

  private setupTradeCalculation(): void {
    if (this.calculateTradeSubscription$) {
      return;
    }

    this.calculateTradeSubscription$ = this.onCalculateTrade$
      .pipe(
        filter(el => el === 'normal'),
        switchMap(() => {
          this.tradeStatus = TRADE_STATUS.LOADING;
          this.cdr.detectChanges();
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);

          const { fromAmount } = this.swapFormService.inputValue;

          const needApprove$ = this.authService.user?.address
            ? this.crossChainRoutingService.needApprove()
            : of(false);

          return forkJoin([this.crossChainRoutingService.calculateTrade(), needApprove$]).pipe(
            map(([{ toAmount, minAmountError, maxAmountError }, needApprove]) => {
              if (
                (minAmountError && fromAmount.gte(minAmountError)) ||
                (maxAmountError && fromAmount.lte(maxAmountError))
              ) {
                this.onCalculateTrade$.next('normal');
                return;
              }
              this.minError = minAmountError || false;
              this.maxError = maxAmountError || false;

              this.needApprove = needApprove;

              this.toAmount = toAmount;
              this.swapFormService.output.patchValue({
                toAmount
              });

              if (
                this.minError ||
                this.maxError ||
                !toAmount ||
                toAmount.isNaN() ||
                toAmount.eq(0) ||
                !this.toWalletAddress
              ) {
                this.tradeStatus = TRADE_STATUS.DISABLED;
              } else {
                this.tradeStatus = needApprove
                  ? TRADE_STATUS.READY_TO_APPROVE
                  : TRADE_STATUS.READY_TO_SWAP;
              }
              this.cdr.detectChanges();
              this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
            }),
            catchError((err: RubicError<ERROR_TYPE>) => {
              this.errorText = err.translateKey || err.message;
              this.swapFormService.output.patchValue({
                toAmount: new BigNumber(NaN)
              });
              this.tradeStatus = TRADE_STATUS.DISABLED;
              this.cdr.detectChanges();
              this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);

              return of(null);
            })
          );
        })
      )
      .subscribe();
  }

  public setupHiddenCalculation(): void {
    if (this.hiddenCalculateTradeSubscription$) {
      return;
    }

    this.hiddenCalculateTradeSubscription$ = this.onCalculateTrade$
      .pipe(
        filter(el => el === 'hidden'),
        switchMap(() => {
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);

          const { fromAmount } = this.swapFormService.inputValue;

          return forkJoin([this.crossChainRoutingService.calculateTrade()]).pipe(
            map(([{ toAmount, minAmountError, maxAmountError }]) => {
              if (
                (minAmountError && fromAmount.gte(minAmountError)) ||
                (maxAmountError && fromAmount.lte(maxAmountError))
              ) {
                this.onCalculateTrade$.next('hidden');
                return;
              }
              this.minError = minAmountError || false;
              this.maxError = maxAmountError || false;

              this.hiddenTradeData$.next({ toAmount });
              if (!toAmount.eq(this.toAmount)) {
                this.tradeStatus = TRADE_STATUS.OLD_TRADE_DATA;
              }

              this.cdr.detectChanges();
              this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
            }),
            catchError((err: RubicError<ERROR_TYPE>) => {
              this.errorText = err.translateKey || err.message;
              this.swapFormService.output.patchValue({
                toAmount: new BigNumber(NaN)
              });
              this.tradeStatus = TRADE_STATUS.DISABLED;
              this.cdr.detectChanges();
              this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);

              return of(null);
            })
          );
        })
      )
      .subscribe();
  }

  public setHiddenData() {
    const data = this.hiddenTradeData$.getValue();
    this.toAmount = data.toAmount;

    if (this.toAmount && !this.toAmount.isNaN()) {
      this.tradeStatus = this.needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
    } else {
      this.tradeStatus = TRADE_STATUS.DISABLED;
    }
    this.cdr.detectChanges();
  }

  public async approveTrade(): Promise<void> {
    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
    this.cdr.detectChanges();
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    let approveInProgressSubscription$: Subscription;
    const onTransactionHash = () => {
      this.cdr.detectChanges();
      approveInProgressSubscription$ = this.notificationsService.show(
        this.translateService.instant('notifications.approveInProgress'),
        {
          status: TuiNotification.Info,
          autoClose: false
        }
      );
    };

    this.crossChainRoutingService
      .approve({
        onTransactionHash
      })
      .pipe(first())
      .subscribe(
        async (_: TransactionReceipt) => {
          approveInProgressSubscription$.unsubscribe();
          this.notificationsService.show(
            this.translateService.instant('notifications.successApprove'),
            {
              status: TuiNotification.Success,
              autoClose: 15000
            }
          );

          await this.tokensService.calculateUserTokensBalances();

          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.cdr.detectChanges();
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
        },
        err => {
          this.errorsService.catch(err);

          approveInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
          this.cdr.detectChanges();
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
        }
      );
  }

  public async createTrade(): Promise<void> {
    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    this.cdr.detectChanges();
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    const onTransactionHash = () => {
      this.notifyTradeInProgress();
    };

    this.crossChainRoutingService
      .createTrade({
        onTransactionHash
      })
      .pipe(first())
      .subscribe(
        async (_: TransactionReceipt) => {
          this.tradeInProgressSubscription$.unsubscribe();
          this.notificationsService.show(
            new PolymorpheusComponent(SuccessTrxNotificationComponent),
            {
              status: TuiNotification.Success,
              autoClose: 15000
            }
          );

          this.counterNotificationsService.updateUnread();
          await this.tokensService.calculateUserTokensBalances();

          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          await this.conditionalCalculate();
        },
        err => {
          this.errorsService.catch(err);

          this.tradeInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.cdr.detectChanges();
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
        }
      );
  }

  private notifyTradeInProgress() {
    this.tradeInProgressSubscription$ = this.notificationsService.show(
      this.translateService.instant('notifications.tradeInProgress'),
      {
        status: TuiNotification.Info,
        autoClose: false
      }
    );

    if (this.window.location.pathname === '/') {
      this.successTxModalService.open('ccr');
    }
  }

  public doButtonAction(clickType: 'swap' | 'approve'): void {
    if (clickType === 'swap') {
      this.createTrade();
    } else {
      this.approveTrade();
    }
  }
}

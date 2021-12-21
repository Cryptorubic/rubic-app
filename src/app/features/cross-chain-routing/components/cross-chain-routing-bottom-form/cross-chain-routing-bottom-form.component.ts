import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { BehaviorSubject, forkJoin, from, of, Subject, Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { TuiNotification } from '@taiga-ui/core';
import {
  catchError,
  debounceTime,
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
import { SuccessTxModalType } from 'src/app/shared/components/success-trx-notification/models/modal-type';
import { RubicWindow } from 'src/app/shared/utils/rubic-window';
import { GoogleTagManagerService } from 'src/app/core/services/google-tag-manager/google-tag-manager.service';
import { SwapFormService } from '../../../swaps/services/swaps-form-service/swap-form.service';
import { TargetNetworkAddressService } from '@features/cross-chain-routing/components/target-network-address/services/target-network-address.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';

type CalculateTradeType = 'normal' | 'hidden';

@Component({
  selector: 'app-cross-chain-routing-bottom-form',
  templateUrl: './cross-chain-routing-bottom-form.component.html',
  styleUrls: ['./cross-chain-routing-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CrossChainRoutingBottomFormComponent implements OnInit {
  // eslint-disable-next-line rxjs/finnish,rxjs/no-exposed-subjects
  @Input() onRefreshTrade: Subject<void>;

  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() favoriteTokens: AvailableTokenAmount[];

  @Output() onRefreshStatusChange = new EventEmitter<REFRESH_BUTTON_STATUS>();

  @Output() tradeStatusChange = new EventEmitter<TRADE_STATUS>();

  public readonly TRADE_STATUS = TRADE_STATUS;

  private readonly onCalculateTrade$ = new Subject<CalculateTradeType>();

  private readonly hiddenTradeData$ = new BehaviorSubject<{ toAmount: BigNumber }>(undefined);

  public readonly displayTargetAddressInput$ = this.targetNetworkAddressService.displayAddress$;

  public toBlockchain: BLOCKCHAIN_NAME;

  public fromAmount: BigNumber;

  public minError: false | BigNumber;

  public maxError: false | BigNumber;

  public needApprove: boolean;

  private _tradeStatus: TRADE_STATUS;

  private toAmount: BigNumber;

  public errorText: string;

  private calculateTradeSubscription$: Subscription;

  private hiddenCalculateTradeSubscription$: Subscription;

  private tradeInProgressSubscription$: Subscription;

  public isTargetNetworkValid: boolean;

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
    return fromBlockchain && toBlockchain && fromToken && toToken && fromAmount?.gt(0);
  }

  constructor(
    public readonly swapFormService: SwapFormService,
    private readonly errorsService: ErrorsService,
    private readonly settingsService: SettingsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly translateService: TranslateService,
    private readonly tokensService: TokensService,
    private readonly notificationsService: NotificationsService,
    private readonly crossChainRoutingService: CrossChainRoutingService,
    private readonly counterNotificationsService: CounterNotificationsService,
    @Self() private readonly destroy$: TuiDestroyService,
    @Inject(WINDOW) private readonly window: RubicWindow,
    private readonly gtmService: GoogleTagManagerService,
    private readonly successTxModalService: SuccessTxModalService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService
  ) {}

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
      .subscribe(form => {
        this.setFormValues(form);
        this.cdr.markForCheck();
      });

    this.settingsService.crossChainRoutingValueChanges
      .pipe(startWith(this.settingsService.crossChainRoutingValue), takeUntil(this.destroy$))
      .subscribe(() => {
        this.conditionalCalculate('normal');
      });

    this.authService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.conditionalCalculate();
      });

    this.onRefreshTrade.pipe(takeUntil(this.destroy$)).subscribe(() => this.conditionalCalculate());
  }

  private setFormValues(form: SwapFormInput): void {
    this.toBlockchain = form.toBlockchain;
    this.fromAmount = form.fromAmount;
    this.conditionalCalculate('normal');
  }

  private conditionalCalculate(type?: CalculateTradeType): void {
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
        debounceTime(200),
        switchMap(() => {
          if (!this.allowTrade) {
            this.tradeStatus = TRADE_STATUS.DISABLED;
            this.swapFormService.output.patchValue({
              toAmount: new BigNumber(NaN)
            });
            return of(null);
          }

          this.tradeStatus = TRADE_STATUS.LOADING;
          this.cdr.detectChanges();
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);

          const { fromAmount, fromBlockchain } = this.swapFormService.inputValue;
          const blockchainType = BlockchainsInfo.getBlockchainType(fromBlockchain);
          const calculateNeedApprove =
            !!this.authService.userAddress && blockchainType === 'ethLike';
          const crossChainTrade$ = from(
            this.crossChainRoutingService.calculateTrade(calculateNeedApprove)
          );
          const balance$ = from(
            this.tokensService.getAndUpdateTokenBalance(this.swapFormService.inputValue.fromToken)
          );

          return forkJoin([crossChainTrade$, balance$]).pipe(
            map(([{ toAmount, minAmountError, maxAmountError, needApprove }]) => {
              if (
                (minAmountError && fromAmount.gte(minAmountError)) ||
                (maxAmountError && fromAmount.lte(maxAmountError))
              ) {
                this.onCalculateTrade$.next('normal');
                return;
              }
              this.minError = minAmountError || false;
              this.maxError = maxAmountError || false;
              this.errorText = '';

              this.needApprove = needApprove;

              this.toAmount = toAmount;
              this.swapFormService.output.patchValue({
                toAmount
              });

              if (this.minError || this.maxError || !toAmount?.isFinite() || toAmount.eq(0)) {
                this.tradeStatus = TRADE_STATUS.DISABLED;
              } else {
                this.tradeStatus = needApprove
                  ? TRADE_STATUS.READY_TO_APPROVE
                  : TRADE_STATUS.READY_TO_SWAP;
              }
              this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
            }),
            // eslint-disable-next-line rxjs/no-implicit-any-catch
            catchError((err: RubicError<ERROR_TYPE>) => {
              this.errorText = err.translateKey || err.message;
              this.swapFormService.output.patchValue({
                toAmount: new BigNumber(NaN)
              });
              this.tradeStatus = TRADE_STATUS.DISABLED;
              this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);

              return of(null);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  public setupHiddenCalculation(): void {
    if (this.hiddenCalculateTradeSubscription$) {
      return;
    }

    this.hiddenCalculateTradeSubscription$ = this.onCalculateTrade$
      .pipe(
        filter(el => el === 'hidden'),
        switchMap(() => {
          if (!this.allowTrade) {
            return null;
          }

          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);

          const { fromAmount } = this.swapFormService.inputValue;
          const crossChainTrade$ = from(this.crossChainRoutingService.calculateTrade());
          const balance$ = from(
            this.tokensService.getAndUpdateTokenBalance(this.swapFormService.inputValue.fromToken)
          );

          return forkJoin([crossChainTrade$, balance$]).pipe(
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

              this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
            }),
            // eslint-disable-next-line rxjs/no-implicit-any-catch
            catchError((err: RubicError<ERROR_TYPE>) => {
              this.errorText = err.translateKey || err.message;
              this.swapFormService.output.patchValue({
                toAmount: new BigNumber(NaN)
              });
              this.tradeStatus = TRADE_STATUS.DISABLED;
              this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);

              return of(null);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  public setHiddenData(): void {
    const data = this.hiddenTradeData$.getValue();
    this.toAmount = data.toAmount;

    if (this.toAmount?.isFinite()) {
      this.errorText = '';
      this.swapFormService.output.patchValue({
        toAmount: this.toAmount
      });
      this.tradeStatus = this.needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
    } else {
      this.tradeStatus = TRADE_STATUS.DISABLED;
    }
  }

  public async approveTrade(): Promise<void> {
    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    let approveInProgressSubscription$: Subscription;
    const onTransactionHash = () => {
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

          await this.tokensService.calculateTokensBalances();

          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);

          this.cdr.markForCheck();
        },
        err => {
          this.errorsService.catch(err);

          approveInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);

          this.cdr.markForCheck();
        }
      );
  }

  public async createTrade(): Promise<void> {
    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    const onTransactionHash = () => {
      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      this.notifyTradeInProgress();
      this.gtmService.notifySignTransaction();
    };

    this.crossChainRoutingService
      .createTrade({
        onTransactionHash
      })
      .pipe(first())
      .subscribe(
        async () => {
          this.tradeInProgressSubscription$.unsubscribe();
          this.notificationsService.show<{ type: SuccessTxModalType }>(
            new PolymorpheusComponent(SuccessTrxNotificationComponent),
            {
              status: TuiNotification.Success,
              autoClose: 15000,
              data: {
                type: 'cross-chain-routing'
              }
            }
          );

          this.counterNotificationsService.updateUnread();

          await this.tokensService.calculateTokensBalances();

          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          await this.conditionalCalculate();
        },
        err => {
          this.errorsService.catch(err);

          this.tradeInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);

          this.cdr.markForCheck();
        }
      );
  }

  private notifyTradeInProgress(): void {
    this.tradeInProgressSubscription$ = this.notificationsService.show(
      this.translateService.instant('notifications.tradeInProgress'),
      {
        status: TuiNotification.Info,
        autoClose: false
      }
    );

    if (this.window.location.pathname === '/') {
      this.successTxModalService.open();
    }
  }
}

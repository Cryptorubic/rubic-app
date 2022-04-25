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
import { forkJoin, from, of, Subject, Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from '@core/errors/errors.service';
import { AuthService } from '@core/services/auth/auth.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { BLOCKCHAIN_NAME, BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { UndefinedError } from '@core/errors/models/undefined.error';
import { TokensService } from '@core/services/tokens/tokens.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInput } from '@features/swaps/features/main-form/models/swap-form';
import { BridgeTokenPairsByBlockchains } from '@features/swaps/features/bridge/models/bridge-token-pairs-by-blockchains';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { CounterNotificationsService } from '@core/services/counter-notifications/counter-notifications.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SuccessTxModalService } from '@features/swaps/features/main-form/services/success-tx-modal-service/success-tx-modal.service';
import { IframeService } from '@core/services/iframe/iframe.service';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { SuccessTrxNotificationComponent } from '@shared/components/success-trx-notification/success-trx-notification.component';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { SwapFormService } from 'src/app/features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { BridgeService } from 'src/app/features/swaps/features/bridge/services/bridge-service/bridge.service';
import { BridgeTradeRequest } from '@features/swaps/features/bridge/models/bridge-trade-request';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';

@Component({
  selector: 'app-bridge-bottom-form',
  templateUrl: './bridge-bottom-form.component.html',
  styleUrls: ['./bridge-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class BridgeBottomFormComponent implements OnInit, OnDestroy {
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() favoriteTokens: AvailableTokenAmount[];

  @Output() tradeStatusChange = new EventEmitter<TRADE_STATUS>();

  public readonly TRADE_STATUS = TRADE_STATUS;

  public readonly BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  private readonly onCalculateTrade$: Subject<void>;

  private bridgeTokenPairsByBlockchainsArray: BridgeTokenPairsByBlockchains[];

  private fromBlockchain: BlockchainName;

  public toBlockchain: BlockchainName;

  private fromToken: TokenAmount;

  private toToken: TokenAmount;

  public minError: false | number;

  public maxError: false | number;

  public toWalletAddress: string;

  public needApprove: boolean;

  private _tradeStatus: TRADE_STATUS;

  private calculateTradeSubscription$: Subscription;

  private tradeInProgressSubscription$: Subscription;

  public get tradeStatus(): TRADE_STATUS {
    return this._tradeStatus;
  }

  public set tradeStatus(value: TRADE_STATUS) {
    this._tradeStatus = value;
    this.tradeStatusChange.emit(value);
  }

  public showSuccessTrxNotification = (): void => {
    this.notificationsService.show(new PolymorpheusComponent(SuccessTrxNotificationComponent), {
      status: TuiNotification.Success,
      autoClose: 15000
    });
  };

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

  constructor(
    public readonly swapFormService: SwapFormService,
    private readonly cdr: ChangeDetectorRef,
    private readonly bridgeService: BridgeService,
    private readonly errorsService: ErrorsService,
    private readonly settingsService: SettingsService,
    private readonly authService: AuthService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    private readonly destroy$: TuiDestroyService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly translateService: TranslateService,
    private readonly tokensService: TokensService,
    private readonly notificationsService: NotificationsService,
    private readonly counterNotificationsService: CounterNotificationsService,
    private readonly successTxModalService: SuccessTxModalService,
    private readonly iframeService: IframeService,
    private readonly gtmService: GoogleTagManagerService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {
    this.onCalculateTrade$ = new Subject<void>();
  }

  ngOnInit() {
    this.setupTradeCalculation();
    this.tradeStatus = TRADE_STATUS.DISABLED;

    this.bridgeService.tokens$.pipe(takeUntil(this.destroy$)).subscribe(tokens => {
      this.bridgeTokenPairsByBlockchainsArray = tokens;
    });

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

    this.authService
      .getCurrentUser()
      .pipe(
        filter(user => !!user?.address),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.setToWalletAddress();
        this.conditionalCalculate();
      });
  }

  public ngOnDestroy(): void {
    this.calculateTradeSubscription$.unsubscribe();
  }

  private setFormValues(form: SwapFormInput): void {
    this.fromBlockchain = form.fromBlockchain;
    this.toBlockchain = form.toBlockchain;
    this.fromToken = form.fromToken;
    this.toToken = form.toToken;
    this.setToWalletAddress();

    this.cdr.detectChanges();

    this.conditionalCalculate();
  }

  private setToWalletAddress(): void {
    this.toWalletAddress = this.authService.userAddress;
  }

  private async conditionalCalculate(): Promise<void> {
    if (!this.fromToken?.address || !this.toToken?.address) {
      this.maxError = false;
      this.minError = false;
    }

    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;
    if (fromBlockchain === toBlockchain) {
      return;
    }

    if (!(await this.bridgeService.isBridgeSupported())) {
      this.tradeStatus = TRADE_STATUS.DISABLED;
      this.cdr.detectChanges();
      return;
    }

    this.cdr.detectChanges();

    this.checkMinMaxAmounts();
    this.onCalculateTrade$.next();
  }

  private setupTradeCalculation(): void {
    if (this.calculateTradeSubscription$) {
      return;
    }

    this.calculateTradeSubscription$ = this.onCalculateTrade$
      .pipe(
        debounceTime(200),
        switchMap(() => {
          if (!this.allowTrade) {
            this.tradeStatus = TRADE_STATUS.DISABLED;
            this.swapFormService.output.patchValue({
              toAmount: new BigNumber(NaN)
            });
            this.cdr.detectChanges();
            return of(null);
          }

          this.tradeStatus = TRADE_STATUS.LOADING;
          this.cdr.detectChanges();

          const needApprove$ = this.authService.user?.address
            ? this.bridgeService.needApprove()
            : of(false);
          const balance$ = from(
            this.tokensService.getAndUpdateTokenBalance(this.swapFormService.inputValue.fromToken)
          );

          return forkJoin([this.bridgeService.getFee(), needApprove$, balance$]).pipe(
            map(([fee, needApprove]) => {
              this.needApprove = needApprove;

              if (fee === null) {
                this.tradeStatus = TRADE_STATUS.DISABLED;
                this.errorsService.catch(new UndefinedError());
                this.cdr.detectChanges();
                return;
              }

              const { fromAmount } = this.swapFormService.inputValue;
              const toAmount = fromAmount.minus(fee);
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
              this.cdr.detectChanges();
            })
          );
        })
      )
      .subscribe();
  }

  public approveTrade(): void {
    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
    this.cdr.detectChanges();

    let approveInProgressSubscription$: Subscription;
    const bridgeTradeRequest: BridgeTradeRequest = {
      onTransactionHash: () => {
        approveInProgressSubscription$ = this.notificationsService.show(
          this.translateService.instant('bridgePage.approveProgressMessage'),
          {
            label: this.translateService.instant('notifications.approveInProgress'),
            status: TuiNotification.Info,
            autoClose: false
          }
        );
      }
    };

    this.bridgeService
      .approve(bridgeTradeRequest)
      .pipe(
        first(),
        tap(() => {
          this.gtmService.fireFormInteractionEvent(SWAP_PROVIDER_TYPE.BRIDGE, 'approve');
          approveInProgressSubscription$.unsubscribe();
          this.notificationsService.show(
            this.translateService.instant('bridgePage.approveSuccessMessage'),
            {
              label: this.translateService.instant('notifications.successApprove'),
              status: TuiNotification.Success,
              autoClose: 15000
            }
          );
        }),
        switchMap(() => this.tokensService.calculateTokensBalances()),
        tap(() => (this.tradeStatus = TRADE_STATUS.READY_TO_SWAP)),
        watch(this.cdr),
        catchError((err: unknown) => {
          approveInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
          this.errorsService.catch(err as RubicError<ERROR_TYPE>);
          this.cdr.detectChanges();
          return of();
        })
      )
      .subscribe();
  }

  public createTrade(): void {
    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    this.cdr.detectChanges();
    const bridgeTradeRequest: BridgeTradeRequest = {
      toAddress: this.toWalletAddress,
      onTransactionHash: (txHash: string) => {
        this.notifyGtmAfterSignTx(txHash);
        this.notifyTradeInProgress(txHash);
      }
    };

    this.bridgeService
      .createTrade(bridgeTradeRequest)
      .pipe(
        first(),
        tap(() => {
          this.tradeInProgressSubscription$.unsubscribe();
          this.counterNotificationsService.updateUnread();
        }),
        switchMap(() => this.tokensService.calculateTokensBalances()),
        tap(() => (this.tradeStatus = TRADE_STATUS.READY_TO_SWAP)),
        watch(this.cdr),
        switchMap(() => this.conditionalCalculate()),
        catchError((err: unknown) => {
          this.tradeInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.errorsService.catch(err as RubicError<ERROR_TYPE>);
          this.cdr.detectChanges();
          return of();
        })
      )
      .subscribe();
  }

  private checkMinMaxAmounts(): void {
    const { fromAmount } = this.swapFormService.inputValue;

    const minAmount = this.getMinMaxAmounts('minAmount');
    const maxAmount = this.getMinMaxAmounts('maxAmount');
    this.maxError = fromAmount?.gt(maxAmount) ? maxAmount : false;
    this.minError = fromAmount?.lt(minAmount) ? minAmount : false;
    this.cdr.detectChanges();
  }

  private getMinMaxAmounts(amountType: 'minAmount' | 'maxAmount'): number {
    const { fromToken, fromBlockchain, toBlockchain } = this.swapFormService.inputValue;

    return this.bridgeTokenPairsByBlockchainsArray
      .find(
        tokenPairsByBlockchains =>
          tokenPairsByBlockchains.fromBlockchain === fromBlockchain &&
          tokenPairsByBlockchains.toBlockchain === toBlockchain
      )
      ?.tokenPairs.find(
        tokenPair =>
          tokenPair.tokenByBlockchain[fromBlockchain]?.address.toLowerCase() ===
          fromToken?.address.toLowerCase()
      )?.tokenByBlockchain[fromBlockchain][amountType];
  }

  public handleClick(clickType: 'swap' | 'approve'): void {
    this.doButtonAction(clickType);
  }

  private doButtonAction(clickType: 'swap' | 'approve'): void {
    if (clickType === 'swap') {
      this.createTrade();
    } else {
      this.approveTrade();
    }
  }

  private notifyTradeInProgress(txHash: string): void {
    this.tradeInProgressSubscription$ = this.notificationsService.show(
      this.translateService.instant('bridgePage.progressMessage'),
      {
        label: this.translateService.instant('notifications.tradeInProgress'),
        status: TuiNotification.Info,
        autoClose: false
      }
    );

    if (this.window.location.pathname === '/') {
      this.successTxModalService.open(
        txHash,
        this.fromBlockchain,
        'bridge',
        this.showSuccessTrxNotification
      );
    }
  }

  private notifyGtmAfterSignTx(txHash: string): void {
    this.gtmService.fireTxSignedEvent(SWAP_PROVIDER_TYPE.BRIDGE, txHash);
  }
}

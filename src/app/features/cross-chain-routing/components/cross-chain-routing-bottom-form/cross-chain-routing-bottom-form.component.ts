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
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { catchError, first, map, startWith, switchMap } from 'rxjs/operators';
import { TransactionReceipt } from 'web3-eth';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { CounterNotificationsService } from 'src/app/core/services/counter-notifications/counter-notifications.service';
import { CrossChainRoutingService } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { CrossChainRoutingTrade } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { REFRESH_BUTTON_STATUS } from 'src/app/shared/components/rubic-refresh-button/rubic-refresh-button.component';
import { SuccessTrxNotificationComponent } from 'src/app/shared/components/success-trx-notification/success-trx-notification.component';
import { SuccessTxModalComponent } from 'src/app/shared/components/success-tx-modal/success-tx-modal.component';
import { SwapFormService } from '../../../swaps/services/swaps-form-service/swap-form.service';
import { SwapsService } from '../../../swaps/services/swaps-service/swaps.service';

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

@Component({
  selector: 'app-cross-chain-routing-bottom-form',
  templateUrl: './cross-chain-routing-bottom-form.component.html',
  styleUrls: ['./cross-chain-routing-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossChainRoutingBottomFormComponent implements OnInit, OnDestroy {
  @Input() onRefreshTrade: Subject<void>;

  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Output() onRefreshStatusChange = new EventEmitter<REFRESH_BUTTON_STATUS>();

  public readonly TRADE_STATUS = TRADE_STATUS;

  public readonly BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  private readonly onCalculateTrade: Subject<void>;

  private fromBlockchain: BLOCKCHAIN_NAME;

  public toBlockchain: BLOCKCHAIN_NAME;

  private fromToken: TokenAmount;

  private toToken: TokenAmount;

  public fromAmount: BigNumber;

  public minError: false | BigNumber;

  public maxError: false | BigNumber;

  public toWalletAddress: string;

  public needApprove: boolean;

  public tradeStatus: TRADE_STATUS;

  private crossChainRoutingTrade: CrossChainRoutingTrade;

  public errorText: string;

  public slippageTolerance: number;

  private formSubscription$: Subscription;

  private settingsSubscription$: Subscription;

  private userSubscription$: Subscription;

  private calculateTradeSubscription$: Subscription;

  private refreshTradeSubscription$: Subscription;

  private tradeInProgressSubscription$: Subscription;

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
    private swapService: SwapsService,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private web3PublicService: Web3PublicService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly translateService: TranslateService,
    private readonly tokensService: TokensService,
    private readonly notificationsService: NotificationsService,
    private readonly crossChainRoutingService: CrossChainRoutingService,
    private readonly counterNotificationsService: CounterNotificationsService
  ) {
    this.onCalculateTrade = new Subject<void>();
  }

  ngOnInit() {
    this.setupTradeCalculation();
    this.tradeStatus = TRADE_STATUS.DISABLED;

    this.formSubscription$ = this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue))
      .subscribe(form => this.setFormValues(form));

    this.settingsSubscription$ = this.settingsService.crossChainRoutingValueChanges
      .pipe(startWith(this.settingsService.crossChainRoutingValue))
      .subscribe(settings => {
        this.slippageTolerance = settings.slippageTolerance;
      });

    this.userSubscription$ = this.authService.getCurrentUser().subscribe(user => {
      this.toWalletAddress = user?.address;
    });

    this.refreshTradeSubscription$ = this.onRefreshTrade.subscribe(() =>
      this.conditionalCalculate()
    );
  }

  ngOnDestroy() {
    this.formSubscription$.unsubscribe();
    this.settingsSubscription$.unsubscribe();
    this.userSubscription$.unsubscribe();
    this.refreshTradeSubscription$.unsubscribe();
  }

  private setFormValues(form: SwapFormInput): void {
    if (
      this.fromBlockchain === form.fromBlockchain &&
      this.toBlockchain === form.toBlockchain &&
      this.fromAmount &&
      this.fromAmount.eq(form.fromAmount) &&
      this.tokensService.isOnlyBalanceUpdated(this.fromToken, form.fromToken) &&
      this.tokensService.isOnlyBalanceUpdated(this.toToken, form.toToken)
    ) {
      return;
    }

    this.fromBlockchain = form.fromBlockchain;
    this.toBlockchain = form.toBlockchain;
    this.fromToken = form.fromToken;
    this.toToken = form.toToken;
    this.fromAmount = form.fromAmount;
    this.cdr.detectChanges();

    this.conditionalCalculate();
  }

  private async conditionalCalculate(): Promise<void> {
    this.maxError = false;
    this.minError = false;
    this.errorText = '';

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

    this.onCalculateTrade.next();
  }

  private setupTradeCalculation(): void {
    if (this.calculateTradeSubscription$) {
      return;
    }

    this.calculateTradeSubscription$ = this.onCalculateTrade
      .pipe(
        switchMap(() => {
          this.tradeStatus = TRADE_STATUS.LOADING;
          this.cdr.detectChanges();
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);

          const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;

          const needApprove$ = this.authService.user?.address
            ? this.crossChainRoutingService.needApprove(fromToken)
            : of(false);

          const minMaxAmounts$ = this.crossChainRoutingService.getMinMaxAmounts(fromToken);

          return forkJoin([
            this.crossChainRoutingService.calculateTrade(fromToken, fromAmount, toToken),
            needApprove$,
            minMaxAmounts$
          ]).pipe(
            map(([trade, needApprove, minMaxAmounts]) => {
              const { minAmount, maxAmount } = minMaxAmounts;
              this.minError = fromAmount?.lt(minAmount) ? minAmount : false;
              this.maxError = fromAmount?.gt(maxAmount) ? maxAmount : false;

              this.needApprove = needApprove;
              this.crossChainRoutingTrade = trade;

              const toAmount = trade.tokenOutAmount;
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
      .approve(this.crossChainRoutingTrade.tokenIn, {
        onTransactionHash
      })
      .pipe(first())
      .subscribe(
        (_: TransactionReceipt) => {
          approveInProgressSubscription$.unsubscribe();
          this.notificationsService.show(
            this.translateService.instant('notifications.successApprove'),
            {
              status: TuiNotification.Success,
              autoClose: 15000
            }
          );

          this.tokensService.calculateUserTokensBalances();

          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.cdr.detectChanges();
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
        },
        err => {
          approveInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
          this.errorsService.catch(err);
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
      .createTrade(this.crossChainRoutingTrade, {
        onTransactionHash
      })
      .pipe(first())
      .subscribe(
        (_: TransactionReceipt) => {
          this.tradeInProgressSubscription$.unsubscribe();
          this.notificationsService.show(
            new PolymorpheusComponent(SuccessTrxNotificationComponent),
            {
              status: TuiNotification.Success,
              autoClose: 15000
            }
          );

          this.counterNotificationsService.updateUnread();
          this.tokensService.calculateUserTokensBalances();

          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.conditionalCalculate();
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
        },
        err => {
          this.tradeInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.errorsService.catch(err);
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

    if (window.location.pathname === '/') {
      this.dialogService
        .open(new PolymorpheusComponent(SuccessTxModalComponent, this.injector), {
          size: 's',
          data: { idPrefix: '' }
        })
        .subscribe();
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

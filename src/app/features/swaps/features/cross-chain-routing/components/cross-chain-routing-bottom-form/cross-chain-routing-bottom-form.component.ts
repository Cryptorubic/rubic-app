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
import { forkJoin, from, Observable, of, Subject, Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import { ErrorsService } from '@core/errors/errors.service';
import { AuthService } from '@core/services/auth/auth.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  EthLikeBlockchainName
} from '@shared/models/blockchain/blockchain-name';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInput } from '@features/swaps/features/main-form/models/swap-form';
import { CounterNotificationsService } from '@core/services/counter-notifications/counter-notifications.service';
import { CrossChainRoutingService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { REFRESH_BUTTON_STATUS } from '@shared/components/rubic-refresh-button/rubic-refresh-button.component';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SwapFormService } from 'src/app/features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { TargetNetworkAddressService } from '@features/swaps/features/cross-chain-routing/components/target-network-address/services/target-network-address.service';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { isEthLikeBlockchainName } from '@shared/utils/blockchain/check-blockchain-name';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import { CROSS_CHAIN_PROVIDER } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import {
  CrosschainSwapSchemeData,
  SwapSchemeModalComponent
} from '../swap-scheme-modal/swap-scheme-modal.component';

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

  public toBlockchain: BlockchainName;

  public toToken: TokenAmount;

  private toAmount: BigNumber;

  private _tradeStatus: TRADE_STATUS;

  public needApprove: boolean;

  /**
   * True, if 'approve' button should be shown near 'swap' button.
   */
  public withApproveButton: boolean;

  public minError: false | BigNumber;

  public maxError: false | BigNumber;

  public errorText: string;

  private readonly onCalculateTrade$ = new Subject<CalculateTradeType>();

  private hiddenTradeData: { toAmount: BigNumber } = null;

  private calculateTradeSubscription$: Subscription;

  private hiddenCalculateTradeSubscription$: Subscription;

  public readonly displayTargetAddressInput$ = this.targetNetworkAddressService.displayAddress$;

  public smartRouting: SmartRouting = null;

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

  get showSmartRouting(): boolean {
    return (
      Boolean(this.smartRouting) &&
      this.crossChainRoutingService.crossChainProvider !== CROSS_CHAIN_PROVIDER.SYMBIOSIS
    );
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    public readonly swapFormService: SwapFormService,
    private readonly errorsService: ErrorsService,
    private readonly settingsService: SettingsService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly crossChainRoutingService: CrossChainRoutingService,
    private readonly counterNotificationsService: CounterNotificationsService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.setupNormalTradeCalculation();
    this.setupHiddenTradeCalculation();

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
        const { fromBlockchain, toBlockchain } = form;
        this.crossChainRoutingService.setIsSupportedCelerBlockchainPair(
          fromBlockchain as EthLikeBlockchainName,
          toBlockchain as EthLikeBlockchainName
        );
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
      .pipe(
        filter(user => !!user?.address),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.conditionalCalculate('normal');
      });

    this.onRefreshTrade.pipe(takeUntil(this.destroy$)).subscribe(() => this.conditionalCalculate());
  }

  public openSwapSchemeModal(): void {
    const { fromBlockchain, toBlockchain, fromToken, toToken } = this.swapFormService.inputValue;
    this.dialogService
      .open<CrosschainSwapSchemeData>(new PolymorpheusComponent(SwapSchemeModalComponent), {
        size: 'xl' as 'l',
        data: {
          fromToken,
          fromBlockchain,
          toToken,
          toBlockchain,
          srcProvider: this.smartRouting.fromProvider,
          dstProvider: this.smartRouting.toProvider,
          crossChainProvider: CROSS_CHAIN_PROVIDER.SYMBIOSIS,
          srcTxHash: '',
          srcTxBlockNumber: 123
        }
      })
      .subscribe();
  }

  private setFormValues(form: SwapFormInput): void {
    this.toBlockchain = form.toBlockchain;
    this.toToken = form.toToken;

    if (!form.fromToken || !form.toToken || !form.fromAmount?.gt(0)) {
      this.smartRouting = null;
    }

    this.conditionalCalculate('normal');
  }

  private conditionalCalculate(type?: CalculateTradeType): void {
    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;
    if (fromBlockchain === toBlockchain) {
      return;
    }

    const { fromToken, toToken } = this.swapFormService.inputValue;
    if (!fromToken?.address || !toToken?.address) {
      this.maxError = false;
      this.minError = false;
      this.errorText = '';
    }

    const { autoRefresh } = this.settingsService.crossChainRoutingValue;
    this.onCalculateTrade$.next(type || (autoRefresh ? 'normal' : 'hidden'));
  }

  private setupNormalTradeCalculation(): void {
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
          const calculateNeedApprove =
            Boolean(this.authService.userAddress) && isEthLikeBlockchainName(fromBlockchain);
          const crossChainTrade$ = from(
            this.crossChainRoutingService.calculateTrade(calculateNeedApprove)
          );
          const balance$ = from(
            this.tokensService.getAndUpdateTokenBalance(this.swapFormService.inputValue.fromToken)
          );

          return forkJoin([crossChainTrade$, balance$]).pipe(
            map(([{ toAmount, minAmountError, maxAmountError, needApprove }]) => {
              if (
                (minAmountError &&
                  fromAmount.gte(minAmountError) &&
                  fromBlockchain !== BLOCKCHAIN_NAME.NEAR) ||
                (maxAmountError && fromAmount.lte(maxAmountError))
              ) {
                this.onCalculateTrade$.next('normal');
                return;
              }

              this.minError = minAmountError || false;
              this.maxError = maxAmountError || false;
              this.errorText = '';

              this.needApprove = needApprove;
              this.withApproveButton = this.needApprove;

              this.toAmount = toAmount;
              this.swapFormService.output.patchValue({
                toAmount
              });
              this.smartRouting = this.crossChainRoutingService.smartRouting;
              this.hiddenTradeData = null;

              if (this.minError || this.maxError || !toAmount?.gt(0)) {
                this.tradeStatus = TRADE_STATUS.DISABLED;
              } else {
                this.tradeStatus = needApprove
                  ? TRADE_STATUS.READY_TO_APPROVE
                  : TRADE_STATUS.READY_TO_SWAP;
              }
            }),
            // eslint-disable-next-line rxjs/no-implicit-any-catch
            catchError((err: RubicError<ERROR_TYPE>) => this.onCalculateError(err))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);

        this.cdr.markForCheck();
      });
  }

  public setupHiddenTradeCalculation(): void {
    if (this.hiddenCalculateTradeSubscription$) {
      return;
    }

    this.hiddenCalculateTradeSubscription$ = this.onCalculateTrade$
      .pipe(
        filter(el => el === 'hidden' && Boolean(this.authService.userAddress)),
        switchMap(() => {
          if (!this.allowTrade) {
            return of(null);
          }

          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);

          const { fromBlockchain, fromAmount } = this.swapFormService.inputValue;
          const crossChainTrade$ = from(this.crossChainRoutingService.calculateTrade());

          return forkJoin([crossChainTrade$]).pipe(
            map(([{ toAmount, minAmountError, maxAmountError }]) => {
              if (
                (minAmountError &&
                  fromAmount.gte(minAmountError) &&
                  fromBlockchain !== BLOCKCHAIN_NAME.NEAR) ||
                (maxAmountError && fromAmount.lte(maxAmountError))
              ) {
                this.onCalculateTrade$.next('hidden');
                return;
              }

              this.minError = minAmountError || false;
              this.maxError = maxAmountError || false;

              this.hiddenTradeData = { toAmount };
              if (!toAmount.eq(this.toAmount)) {
                this.tradeStatus = TRADE_STATUS.OLD_TRADE_DATA;
              }
            }),
            // eslint-disable-next-line rxjs/no-implicit-any-catch
            catchError((err: RubicError<ERROR_TYPE>) => this.onCalculateError(err))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);

        this.cdr.markForCheck();
      });
  }

  public onCalculateError(err: RubicError<ERROR_TYPE>): Observable<null> {
    this.errorText = err.translateKey || err.message;

    this.toAmount = new BigNumber(NaN);
    this.swapFormService.output.patchValue({
      toAmount: new BigNumber(NaN)
    });
    this.tradeStatus = TRADE_STATUS.DISABLED;

    return of(null);
  }

  public onSetHiddenData(): void {
    this.toAmount = this.hiddenTradeData.toAmount;

    if (this.toAmount?.isFinite()) {
      this.errorText = '';

      this.swapFormService.output.patchValue({
        toAmount: this.toAmount
      });
      this.smartRouting = this.crossChainRoutingService.smartRouting;

      this.tradeStatus = this.needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
    } else {
      this.smartRouting = null;

      this.tradeStatus = TRADE_STATUS.DISABLED;
    }
  }

  public async approveTrade(): Promise<void> {
    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    try {
      const { fromBlockchain } = this.swapFormService.inputValue;
      await this.crossChainRoutingService.approve();

      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      this.needApprove = false;

      this.gtmService.updateFormStep(SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING, 'approve');

      await this.tokensService.updateNativeTokenBalance(fromBlockchain);
    } catch (err) {
      this.errorsService.catch(err);

      this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
    }
    this.cdr.detectChanges();

    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
  }

  public async createTrade(): Promise<void> {
    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    try {
      const { fromBlockchain, fromToken } = this.swapFormService.inputValue;
      await this.crossChainRoutingService.createTrade(() => {
        if (fromBlockchain !== BLOCKCHAIN_NAME.NEAR) {
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.cdr.detectChanges();
        }
      });

      this.conditionalCalculate('hidden');

      this.counterNotificationsService.updateUnread();

      await this.tokensService.updateTokenBalanceAfterSwap({
        address: fromToken.address,
        blockchain: fromBlockchain
      });
    } catch (err) {
      this.errorsService.catch(err);

      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      this.cdr.detectChanges();

      this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
    }
  }
}

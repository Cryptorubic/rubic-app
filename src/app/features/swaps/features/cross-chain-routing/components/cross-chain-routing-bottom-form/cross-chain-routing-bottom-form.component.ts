import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Injector,
  INJECTOR,
  Input,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { from, Observable, of, Subject, Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { ErrorsService } from '@core/errors/errors.service';
import { AuthService } from '@core/services/auth/auth.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInput } from '@features/swaps/features/main-form/models/swap-form';
import { CrossChainRoutingService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { REFRESH_BUTTON_STATUS } from '@shared/components/rubic-refresh-button/rubic-refresh-button.component';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SwapFormService } from 'src/app/features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { TargetNetworkAddressService } from '@features/swaps/features/cross-chain-routing/components/target-network-address/services/target-network-address.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import { BlockchainName, CROSS_CHAIN_TRADE_TYPE, RubicSdkError } from 'rubic-sdk';
import { switchTap } from '@shared/utils/utils';
import { CrossChainMinAmountError } from 'rubic-sdk/lib/common/errors/cross-chain/cross-chain-min-amount.error';
import { CrossChainMaxAmountError } from 'rubic-sdk/lib/common/errors/cross-chain/cross-chain-max-amount.error';
import { CalculatedProvider } from '@features/swaps/features/cross-chain-routing/models/calculated-provider';
import { CrossChainProviderTrade } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-provider-trade';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { IframeService } from '@core/services/iframe/iframe.service';
import { ViaSlippageWarningModalComponent } from '@shared/components/via-slippage-warning-modal/via-slippage-warning-modal.component';
import { NotWhitelistedProviderError } from 'rubic-sdk/lib/common/errors/swap/not-whitelisted-provider.error';

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

  public calculatedProviders: CalculatedProvider | null = null;

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

  public minError: false | { amount: BigNumber; symbol: string };

  public maxError: false | { amount: BigNumber; symbol: string };

  public errorText: string;

  private readonly onCalculateTrade$ = new Subject<CalculateTradeType>();

  private hiddenTradeData: CrossChainProviderTrade | null = null;

  private calculateTradeSubscription$: Subscription;

  private hiddenCalculateTradeSubscription$: Subscription;

  public readonly displayTargetAddressInput$ = this.targetNetworkAddressService.displayAddress$;

  public smartRouting: SmartRouting = null;

  private crossChainProviderTrade: CrossChainProviderTrade;

  private isViaDisabled = false;

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
      Boolean(this.smartRouting) && Boolean(this.swapFormService.outputValue.toAmount?.isFinite())
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
    private readonly gtmService: GoogleTagManagerService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly dialogService: TuiDialogService,
    @Inject(INJECTOR) private readonly injector: Injector,
    private readonly iframeService: IframeService
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

    this.onRefreshTrade
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.conditionalCalculate('normal'));
  }

  private setFormValues(form: SwapFormInput): void {
    this.isViaDisabled = false;

    this.toBlockchain = form.toBlockchain;
    this.toToken = form.toToken;

    if (!form.fromToken || !form.toToken || !form.fromAmount?.gt(0)) {
      this.smartRouting = null;
    }

    if (
      form.fromToken &&
      form.toToken &&
      !this.crossChainRoutingService.isSupportedBlockchains(form.fromBlockchain, form.toBlockchain)
    ) {
      const unsupportedBlockchain = !CrossChainRoutingService.isSupportedBlockchain(
        form.fromBlockchain
      )
        ? form.fromBlockchain
        : !CrossChainRoutingService.isSupportedBlockchain(form.toBlockchain)
        ? form.toBlockchain
        : null;
      if (unsupportedBlockchain) {
        this.errorText = `Swaps to and from ${unsupportedBlockchain} are temporarily disabled for extended maintenance.`;
      } else {
        this.errorText = 'Selected blockchains are not supported in Cross-Chain.';
      }
      return;
    }
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

    this.onCalculateTrade$.next(type);
  }

  private setupNormalTradeCalculation(): void {
    if (this.calculateTradeSubscription$) {
      return;
    }

    this.calculateTradeSubscription$ = this.onCalculateTrade$
      .pipe(
        filter(el => el === 'normal'),
        debounceTime(200),
        map(() => {
          if (!this.allowTrade) {
            this.tradeStatus = TRADE_STATUS.DISABLED;
            this.swapFormService.output.patchValue({
              toAmount: new BigNumber(NaN)
            });
            return false;
          }

          this.tradeStatus = TRADE_STATUS.LOADING;
          this.cdr.detectChanges();

          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);
          return true;
        }),
        switchMap(allowTrade => {
          if (!allowTrade) {
            return of(null);
          }
          const { fromAmount } = this.swapFormService.inputValue;
          const isUserAuthorized = Boolean(this.authService.userAddress);

          const crossChainTrade$ = this.crossChainRoutingService.calculateTrade(
            isUserAuthorized,
            this.isViaDisabled
          );

          const balance$ = from(
            this.tokensService.getAndUpdateTokenBalance(this.swapFormService.inputValue.fromToken)
          );

          return crossChainTrade$.pipe(
            debounceTime(200),
            switchTap(() => balance$),
            tap(({ totalProviders, currentProviders, trade }) => {
              this.calculatedProviders = {
                current: currentProviders,
                total: totalProviders,
                hasBestTrade: Boolean(trade)
              };
            }),
            map(providerTrade => {
              this.crossChainProviderTrade = providerTrade;
              const { trade, error, needApprove, totalProviders, currentProviders, smartRouting } =
                providerTrade;
              if (currentProviders === 0) {
                return;
              }
              if (
                error !== undefined &&
                trade?.type !== CROSS_CHAIN_TRADE_TYPE.LIFI &&
                trade?.type !== CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS &&
                ((error instanceof CrossChainMinAmountError && fromAmount.gte(error.minAmount)) ||
                  (error instanceof CrossChainMaxAmountError && fromAmount.lte(error.maxAmount)))
              ) {
                this.onCalculateTrade$.next('normal');
                return;
              }

              this.minError =
                error instanceof CrossChainMinAmountError
                  ? { amount: error.minAmount, symbol: error.tokenSymbol }
                  : false;
              this.maxError =
                error instanceof CrossChainMaxAmountError
                  ? { amount: error.maxAmount, symbol: error.tokenSymbol }
                  : false;
              this.errorText = '';

              this.needApprove = needApprove;
              this.withApproveButton = this.needApprove;

              if (trade?.to?.tokenAmount) {
                this.toAmount = trade?.to?.tokenAmount;
                this.crossChainRoutingService.crossChainTrade = trade;
                this.swapFormService.output.patchValue({
                  toAmount: trade?.to.tokenAmount
                });
                this.smartRouting = smartRouting;
                this.hiddenTradeData = null;

                if (this.minError || this.maxError || this.toAmount?.lte(0)) {
                  this.tradeStatus = TRADE_STATUS.DISABLED;
                } else {
                  this.tradeStatus = this.needApprove
                    ? TRADE_STATUS.READY_TO_APPROVE
                    : TRADE_STATUS.READY_TO_SWAP;
                }
              } else if (currentProviders === totalProviders) {
                throw error;
              }
            }),
            // eslint-disable-next-line rxjs/no-implicit-any-catch
            catchError((err: RubicSdkError | undefined) => this.onCalculateError(err))
          );
        }),
        tap(() => {
          if (this.calculatedProviders?.total === this.calculatedProviders?.current) {
            this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
          }
        }),
        watch(this.cdr),
        takeUntil(this.destroy$)
      )
      .subscribe();
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

          const { fromAmount } = this.swapFormService.inputValue;

          return from(this.crossChainRoutingService.calculateTrade(false, this.isViaDisabled)).pipe(
            map(providerTrade => {
              const { trade, error, currentProviders } = providerTrade;
              if (currentProviders === 0) {
                return;
              }
              if (
                error &&
                trade?.type !== CROSS_CHAIN_TRADE_TYPE.LIFI &&
                trade?.type !== CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS &&
                ((error instanceof CrossChainMinAmountError && fromAmount.gte(error.minAmount)) ||
                  (error instanceof CrossChainMaxAmountError && fromAmount.lte(error.maxAmount)))
              ) {
                this.onCalculateTrade$.next('hidden');
                return;
              }

              this.minError =
                error instanceof CrossChainMinAmountError
                  ? { amount: error.minAmount, symbol: error.tokenSymbol }
                  : false;
              this.maxError =
                error instanceof CrossChainMaxAmountError
                  ? { amount: error.maxAmount, symbol: error.tokenSymbol }
                  : false;

              this.hiddenTradeData = providerTrade;
              const hiddenToAmount = trade?.to?.tokenAmount;
              if (
                hiddenToAmount &&
                this.toAmount?.isFinite() &&
                !hiddenToAmount.eq(this.toAmount)
              ) {
                this.tradeStatus = TRADE_STATUS.OLD_TRADE_DATA;
              }
            }),
            // eslint-disable-next-line rxjs/no-implicit-any-catch
            catchError((err: RubicSdkError) => this.onCalculateError(err))
          );
        }),
        tap(() => this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED)),
        watch(this.cdr),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public onCalculateError(error: RubicSdkError | undefined): Observable<null> {
    const parsedError = this.crossChainRoutingService.parseCalculationError(error);
    this.errorText = parsedError.translateKey || parsedError.message;

    this.toAmount = new BigNumber(NaN);
    this.swapFormService.output.patchValue({
      toAmount: new BigNumber(NaN)
    });
    this.tradeStatus = TRADE_STATUS.DISABLED;
    return of(null);
  }

  public onSetHiddenData(): void {
    this.toAmount = this.hiddenTradeData.trade?.to?.tokenAmount;

    if (this.toAmount?.isFinite()) {
      this.errorText = '';

      this.crossChainProviderTrade = this.hiddenTradeData;
      this.crossChainRoutingService.crossChainTrade = this.hiddenTradeData.trade;
      this.swapFormService.output.patchValue({
        toAmount: this.toAmount
      });
      this.smartRouting = this.hiddenTradeData.smartRouting;

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
      await this.crossChainRoutingService.approve(this.crossChainProviderTrade);

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
    if (!this.isSlippageCorrect()) {
      return;
    }

    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    try {
      const { fromBlockchain, fromToken } = this.swapFormService.inputValue;
      await this.crossChainRoutingService.createTrade(this.crossChainProviderTrade, () => {
        this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
        this.cdr.detectChanges();
      });

      this.conditionalCalculate('hidden');

      await this.tokensService.updateTokenBalanceAfterCcrSwap({
        address: fromToken.address,
        blockchain: fromBlockchain
      });
    } catch (err) {
      this.errorsService.catch(err);

      if (err instanceof NotWhitelistedProviderError) {
        this.isViaDisabled = true;
        this.conditionalCalculate('normal');
        return;
      }

      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      this.cdr.detectChanges();

      this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
    }
  }

  private isSlippageCorrect(): boolean {
    if (
      !this.crossChainProviderTrade ||
      this.crossChainProviderTrade.trade?.type !== CROSS_CHAIN_TRADE_TYPE.VIA ||
      this.settingsService.crossChainRoutingValue.autoSlippageTolerance
    ) {
      return true;
    }
    const size = this.iframeService.isIframe ? 'fullscreen' : 's';
    this.dialogService
      .open(new PolymorpheusComponent(ViaSlippageWarningModalComponent, this.injector), {
        size
      })
      .subscribe();
    return false;
  }
}

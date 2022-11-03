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
import {
  forkJoin,
  from,
  Observable,
  of,
  Subject,
  combineLatest,
  Subscription,
  firstValueFrom
} from 'rxjs';
import BigNumber from 'bignumber.js';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  take,
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
import { TargetNetworkAddressService } from '@features/swaps/shared/target-network-address/services/target-network-address.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import {
  BlockchainName,
  BlockchainsInfo,
  CROSS_CHAIN_TRADE_TYPE,
  MaxAmountError,
  MinAmountError,
  RubicSdkError,
  WrappedCrossChainTrade
} from 'rubic-sdk';
import { switchTap } from '@shared/utils/utils';
import { CalculatedProvider } from '@features/swaps/features/cross-chain-routing/models/calculated-provider';
import { CrossChainProviderTrade } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-provider-trade';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { IframeService } from '@core/services/iframe/iframe.service';
import { AutoSlippageWarningModalComponent } from '@shared/components/via-slippage-warning-modal/auto-slippage-warning-modal.component';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import NotWhitelistedProviderWarning from '@core/errors/models/common/not-whitelisted-provider.warning';
import { ExecutionRevertedError } from '@core/errors/models/common/execution-reverted.error';
import { RubicSdkErrorParser } from '@core/errors/models/rubic-sdk-error-parser';

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

  public readonly displayTargetAddressInput$ =
    this.settingsService.crossChainRoutingValueChanges.pipe(
      startWith(this.settingsService.crossChainRoutingValue),
      map(value => value.showReceiverAddress)
    );

  public smartRouting: SmartRouting = null;

  private crossChainProviderTrade: CrossChainProviderTrade;

  private isViaDisabled = false;

  private swapStarted = false;

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
    this.setupSelectSubscription();

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

    // We did not use distinctUntilChanged because the PREV value was not updated.
    let prevToggleValue: boolean;
    this.settingsService.crossChainRoutingValueChanges
      .pipe(
        startWith(this.settingsService.crossChainRoutingValue),
        distinctUntilChanged((prev, next) => {
          return (
            prev.autoSlippageTolerance === next.autoSlippageTolerance &&
            prev.slippageTolerance === next.slippageTolerance
          );
        }),
        filter(settings => {
          if (settings.showReceiverAddress === prevToggleValue) {
            prevToggleValue = settings.showReceiverAddress;
            return true;
          }
          prevToggleValue = settings.showReceiverAddress;
          return false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.conditionalCalculate('normal');
      });

    this.crossChainRoutingService.dangerousProviders$
      .pipe(
        filter(providers => providers.length !== 0),
        distinctUntilChanged((prev, curr) => prev.length === curr.length),
        debounceTime(200),
        takeUntil(this.destroy$)
      )
      .subscribe(async dangerousProviders => {
        const providers = await firstValueFrom(this.crossChainRoutingService.providers$);
        const nextProvider = providers?.find(provider =>
          dangerousProviders.every(dangerousProvider => dangerousProvider !== provider.tradeType)
        );
        if (nextProvider) {
          this.crossChainRoutingService.setSelectedProvider(nextProvider?.tradeType);
          this.errorsService.catch(new NotWhitelistedProviderWarning());
        }
      });

    this.authService.currentUser$
      .pipe(
        filter(user => !!user?.address),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.conditionalCalculate('normal');
      });

    this.onRefreshTrade.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.conditionalCalculate('normal');
    });

    combineLatest([this.targetNetworkAddressService.address$, this.displayTargetAddressInput$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.conditionalCalculate('normal');
      });
  }

  private setFormValues(form: SwapFormInput): void {
    this.isViaDisabled = false;

    this.toBlockchain = form.toBlockchain;
    this.toToken = form.toToken;
    this.smartRouting = null;

    if (
      form.fromToken &&
      form.toToken &&
      !this.crossChainRoutingService.areSupportedBlockchains(form.fromBlockchain, form.toBlockchain)
    ) {
      let unsupportedBlockchain = null;
      if (this.crossChainRoutingService.isSupportedBlockchain(form.fromBlockchain)) {
        unsupportedBlockchain = form.fromBlockchain;
      } else if (!this.crossChainRoutingService.isSupportedBlockchain(form.toBlockchain)) {
        unsupportedBlockchain = form.toBlockchain;
      }

      if (unsupportedBlockchain) {
        this.errorText = `Swaps to and from ${unsupportedBlockchain} are temporarily disabled for extended maintenance.`;
      } else {
        this.errorText = 'Selected blockchains are not supported in Cross-Chain.';
      }
      return;
    }

    this.conditionalCalculate('normal');
  }

  private conditionalCalculate(type: CalculateTradeType): void {
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

    this.swapStarted = false;
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
          const { fromBlockchain } = this.swapFormService.inputValue;
          const isUserAuthorized =
            Boolean(this.authService.userAddress) &&
            this.authService.userChainType === BlockchainsInfo.getChainType(fromBlockchain);

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
              if (!this.swapStarted) {
                this.selectProvider(providerTrade);
              }
            }),
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

  public selectProvider(providerTrade: CrossChainProviderTrade): void {
    const { fromAmount } = this.swapFormService.inputValue;
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
      ((error instanceof MinAmountError && fromAmount.gte(error.minAmount)) ||
        (error instanceof MaxAmountError && fromAmount.lte(error.maxAmount)))
    ) {
      this.onCalculateTrade$.next('normal');
      return;
    }

    this.minError =
      error instanceof MinAmountError
        ? { amount: error.minAmount, symbol: error.tokenSymbol }
        : false;
    this.maxError =
      error instanceof MaxAmountError
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
    this.swapStarted = false;
    this.cdr.detectChanges();
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
    const { fromBlockchain } = this.swapFormService.inputValue;
    this.swapStarted = true;

    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    try {
      await this.crossChainRoutingService.approve(this.crossChainProviderTrade);

      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      this.needApprove = false;

      this.gtmService.updateFormStep(SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING, 'approve');

      await this.tokensService.updateNativeTokenBalance(fromBlockchain);
    } catch (err) {
      this.errorsService.catch(err as RubicError<ERROR_TYPE> | Error);
      this.swapStarted = false;
      this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
    }
    this.cdr.detectChanges();
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
  }

  public async createTrade(): Promise<void> {
    this.swapStarted = true;
    if (!this.isSlippageCorrect()) {
      return;
    }

    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    try {
      throw new NotWhitelistedProviderWarning('0x11111');
      const { fromBlockchain, fromToken } = this.swapFormService.inputValue;
      await this.crossChainRoutingService.createTrade(this.crossChainProviderTrade, () => {
        this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
        this.cdr.detectChanges();
      });
      this.crossChainRoutingService.unmarkProviderAsDangerous(
        this.crossChainProviderTrade.tradeType
      );

      this.conditionalCalculate('normal');

      await this.tokensService.updateTokenBalanceAfterCcrSwap({
        address: fromToken.address,
        blockchain: fromBlockchain
      });
    } catch (err) {
      const error = RubicSdkErrorParser.parseError(err);
      if (
        error instanceof NotWhitelistedProviderWarning ||
        error instanceof ExecutionRevertedError
      ) {
        this.crossChainRoutingService.markProviderAsDangerous(
          this.crossChainProviderTrade.tradeType
        );
      } else {
        this.errorsService.catch(err);
      }

      if (error instanceof NotWhitelistedProviderWarning) {
        await this.crossChainRoutingService.saveNewProvider(
          this.crossChainProviderTrade.trade.from.blockchain,
          this.crossChainProviderTrade.trade.type,
          error.providerRouter
        );
      }

      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      this.cdr.detectChanges();

      this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
    }
  }

  private isSlippageCorrect(): boolean {
    if (
      !this.crossChainProviderTrade ||
      this.settingsService.crossChainRoutingValue.autoSlippageTolerance ||
      (this.crossChainProviderTrade.trade?.type !== CROSS_CHAIN_TRADE_TYPE.VIA &&
        this.crossChainProviderTrade.trade?.type !== CROSS_CHAIN_TRADE_TYPE.BRIDGERS)
    ) {
      return true;
    }
    const size = this.iframeService.isIframe ? 'fullscreen' : 's';
    this.dialogService
      .open(new PolymorpheusComponent(AutoSlippageWarningModalComponent, this.injector), {
        size
      })
      .subscribe();
    return false;
  }

  private setupSelectSubscription(): void {
    this.crossChainRoutingService.selectedProvider$
      .pipe(
        filter(provider => provider !== null),
        switchMap(type => {
          return forkJoin([of(type), this.crossChainRoutingService.allProviders$.pipe(take(1))]);
        }),
        switchMap(([type, allProviders]) => {
          const selectedProvider: WrappedCrossChainTrade & { rank: number } =
            allProviders.data.find(provider => provider.tradeType === type);
          return forkJoin([
            of(selectedProvider),
            of(this.crossChainRoutingService.calculateSmartRouting(selectedProvider)),
            from(selectedProvider.trade.needApprove()).pipe(catchError(() => of(false)))
          ]);
        })
      )
      .subscribe(([selectedProvider, smartRouting, needApprove]) => {
        const provider: CrossChainProviderTrade = {
          ...selectedProvider,
          needApprove,
          totalProviders: this.crossChainProviderTrade.totalProviders,
          currentProviders: this.crossChainProviderTrade.currentProviders,
          smartRouting
        };
        this.selectProvider(provider);
      });
  }
}

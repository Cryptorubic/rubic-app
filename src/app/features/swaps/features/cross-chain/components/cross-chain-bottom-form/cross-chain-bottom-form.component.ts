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
import { forkJoin, from, of, combineLatest, Subscription, firstValueFrom } from 'rxjs';
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
  takeUntil
} from 'rxjs/operators';
import { ErrorsService } from '@core/errors/errors.service';
import { AuthService } from '@core/services/auth/auth.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInput } from '@features/swaps/features/swaps-form/models/swap-form';
import { CrossChainCalculationService } from '@features/swaps/features/cross-chain/services/cross-chain-calculation-service/cross-chain-calculation.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SwapFormService } from 'src/app/features/swaps/core/services/swap-form-service/swap-form.service';
import { TargetNetworkAddressService } from '@features/swaps/shared/target-network-address/services/target-network-address.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { CrossChainRoute } from '@features/swaps/features/cross-chain/services/cross-chain-calculation-service/models/cross-chain-route';
import { BlockchainName, CROSS_CHAIN_TRADE_TYPE, WrappedCrossChainTrade } from 'rubic-sdk';
import { CalculatedTradesAmounts } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/models/calculated-trades-amounts';
import { CalculatedCrossChainTrade } from '@features/swaps/features/cross-chain/models/calculated-cross-chain-trade';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { IframeService } from '@core/services/iframe/iframe.service';
import { AutoSlippageWarningModalComponent } from '@shared/components/via-slippage-warning-modal/auto-slippage-warning-modal.component';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import NotWhitelistedProviderWarning from '@core/errors/models/common/not-whitelisted-provider.warning';
import { ExecutionRevertedError } from '@core/errors/models/common/execution-reverted.error';
import { RubicSdkErrorParser } from '@core/errors/models/rubic-sdk-error-parser';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';

type CalculateTradeType = 'normal' | 'hidden';

@Component({
  selector: 'app-cross-chain-bottom-form',
  templateUrl: './cross-chain-bottom-form.component.html',
  styleUrls: ['./cross-chain-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CrossChainBottomFormComponent implements OnInit {
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() favoriteTokens: AvailableTokenAmount[];

  @Output() tradeStatusChange = new EventEmitter<TRADE_STATUS>();

  public calculatedProviders: CalculatedTradesAmounts | null = null;

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

  private hiddenTradeData: CalculatedCrossChainTrade | null = null;

  private calculateTradeSubscription$: Subscription;

  public readonly displayTargetAddressInput$ =
    this.settingsService.crossChainRoutingValueChanges.pipe(
      startWith(this.settingsService.crossChainRoutingValue),
      map(value => value.showReceiverAddress)
    );

  public route: CrossChainRoute = null;

  private crossChainProviderTrade: CalculatedCrossChainTrade;

  private isViaDisabled = false;

  private swapStarted = false;

  get tradeStatus(): TRADE_STATUS {
    return this._tradeStatus;
  }

  set tradeStatus(value: TRADE_STATUS) {
    this._tradeStatus = value;
    this.tradeStatusChange.emit(value);
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    public readonly swapFormService: SwapFormService,
    private readonly errorsService: ErrorsService,
    private readonly settingsService: SettingsService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly crossChainRoutingService: CrossChainCalculationService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly dialogService: TuiDialogService,
    private readonly iframeService: IframeService,
    private readonly refreshService: RefreshService,
    @Inject(INJECTOR) private readonly injector: Injector,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
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

    this.refreshService.onRefresh$.pipe(takeUntil(this.destroy$)).subscribe(({ isForced }) => {
      if (isForced || this.settingsService.crossChainRoutingValue.autoRefresh) {
        this.conditionalCalculate('normal');
      }
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
    this.route = null;

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

  private conditionalCalculate(_type: CalculateTradeType): void {
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
    // this.onCalculateTrade$.next(type);
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
      this.route = this.hiddenTradeData.route;

      this.tradeStatus = this.needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
    } else {
      this.route = null;

      this.tradeStatus = TRADE_STATUS.DISABLED;
    }
  }

  public async approveTrade(): Promise<void> {
    const { fromBlockchain } = this.swapFormService.inputValue;
    this.swapStarted = true;

    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
    this.refreshService.setInProgress();

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
    this.refreshService.setStopped();
  }

  public async createTrade(): Promise<void> {
    this.swapStarted = true;
    if (!this.isSlippageCorrect()) {
      return;
    }

    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    this.refreshService.setInProgress();

    try {
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

      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      this.cdr.detectChanges();

      this.refreshService.setStopped();
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
      .subscribe(([_selectedProvider, _smartRouting, _needApprove]) => {
        // const provider: CalculatedCrossChainTrade = {
        //   ...selectedProvider,
        //   needApprove,
        //   totalProviders: this.crossChainProviderTrade.totalProviders,
        //   currentProviders: this.crossChainProviderTrade.currentProviders,
        //   route: smartRouting
        // };
        // this.selectProvider(provider);
      });
  }
}

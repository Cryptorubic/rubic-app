import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { InstantTradeService } from 'src/app/features/instant-trade/services/instant-trade-service/instant-trade.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_STATUS } from '@features/instant-trade/models/instant-trades-trade-status';
import { SwapFormInput } from '@features/swaps/models/swap-form';
import { INSTANT_TRADE_PROVIDERS } from '@features/instant-trade/constants/providers';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, forkJoin, from, of, Subject, Subscription } from 'rxjs';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { NotSupportedItNetwork } from 'src/app/core/errors/models/instant-trade/not-supported-it-network';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { REFRESH_BUTTON_STATUS } from 'src/app/shared/components/rubic-refresh-button/rubic-refresh-button.component';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { InstantTradeProviderData } from '@features/instant-trade/models/providers-controller-data';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { InstantTradeInfo } from '@features/instant-trade/models/instant-trade-info';
import { PERMITTED_PRICE_DIFFERENCE } from '@shared/constants/common/permited-price-difference';
import { SwapInfoService } from '@features/swaps/components/swap-info/services/swap-info.service';
import NoSelectedProviderError from '@core/errors/models/instant-trade/no-selected-provider-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';

export interface CalculationResult {
  status: 'fulfilled' | 'rejected';
  value?: InstantTrade | null;
  reason?: RubicError<ERROR_TYPE>;
}

@Component({
  selector: 'app-instant-trade-bottom-form',
  templateUrl: './instant-trade-bottom-form.component.html',
  styleUrls: ['./instant-trade-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class InstantTradeBottomFormComponent implements OnInit {
  // eslint-disable-next-line rxjs/finnish,rxjs/no-exposed-subjects
  @Input() onRefreshTrade: Subject<void>;

  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() favoriteTokens: AvailableTokenAmount[];

  @Output() onRefreshStatusChange = new EventEmitter<REFRESH_BUTTON_STATUS>();

  @Output() allowRefreshChange = new EventEmitter<boolean>();

  /**
   * Emits info of currently selected trade.
   */
  @Output() instantTradeInfoChange = new EventEmitter<InstantTradeInfo>();

  @Output() tradeStatusChange = new EventEmitter<TRADE_STATUS>();

  public readonly TRADE_STATUS = TRADE_STATUS;

  /**
   * Amount of fee for iframe referral program.
   */
  private readonly IT_PROXY_FEE = 0.003;

  private currentBlockchain: BLOCKCHAIN_NAME;

  private fromToken: TokenAmount;

  public toToken: TokenAmount;

  public fromAmount: BigNumber;

  private _tradeStatus: TRADE_STATUS;

  public providersData: InstantTradeProviderData[];

  private _selectedProvider: InstantTradeProviderData;

  public ethAndWethTrade: InstantTrade | null;

  public isEth: {
    from: boolean;
    to: boolean;
  };

  public needApprove: boolean;

  public isIframe: boolean;

  private isTradeSelectedByUser: boolean;

  private readonly onCalculateTrade$ = new Subject<'normal' | 'hidden'>();

  private hiddenDataAmounts$ = new BehaviorSubject<
    { name: INSTANT_TRADE_PROVIDER; amount: BigNumber; error?: RubicError<ERROR_TYPE> | Error }[]
  >([]);

  private calculateTradeSubscription$: Subscription;

  private hiddenCalculateTradeSubscription$: Subscription;

  public get selectedProvider(): InstantTradeProviderData {
    return this._selectedProvider;
  }

  public set selectedProvider(selectedProvider: InstantTradeProviderData) {
    this._selectedProvider = selectedProvider;
    this.instantTradeInfoChange.emit({
      trade: selectedProvider?.trade,
      isWrappedType: !!this.ethAndWethTrade
    });
  }

  public get tradeStatus(): TRADE_STATUS {
    return this._tradeStatus;
  }

  public set tradeStatus(value: TRADE_STATUS) {
    this._tradeStatus = value;
    this.tradeStatusChange.emit(value);
  }

  public get allowTrade(): boolean {
    const form = this.swapFormService.inputValue;
    return Boolean(
      form.fromBlockchain &&
        form.fromToken &&
        form.toBlockchain &&
        form.toToken &&
        form.fromAmount?.gt(0)
    );
  }

  public get toAmount(): BigNumber {
    if (!this.selectedProvider?.trade) {
      return null;
    }

    if (
      !this.iframeService.isIframeWithFee(
        this.currentBlockchain,
        this.selectedProvider.providerInfo.name
      )
    ) {
      return this.selectedProvider.trade.to.amount;
    }

    return this.selectedProvider.trade.to.amount.multipliedBy(1 - this.IT_PROXY_FEE);
  }

  constructor(
    public readonly swapFormService: SwapFormService,
    private readonly instantTradeService: InstantTradeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly errorService: ErrorsService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly settingsService: SettingsService,
    private readonly iframeService: IframeService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly swapInfoService: SwapInfoService,
    private readonly gtmService: GoogleTagManagerService
  ) {
    this.isTradeSelectedByUser = false;
    this.isIframe = this.iframeService.isIframe;
  }

  public ngOnInit(): void {
    this.setupCalculatingTrades();
    this.setupHiddenCalculatingTrades();

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
        this.setupSwapForm(form);
      });

    this.swapFormService.input.controls.toToken.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(toToken => {
        if (
          TokensService.areTokensEqual(this.toToken, toToken) &&
          this.toToken?.price !== toToken?.price$
        ) {
          this.toToken = toToken;
          this.cdr.markForCheck();
        }
      });

    this.settingsService.instantTradeValueChanges
      .pipe(
        distinctUntilChanged((prev, next) => {
          return (
            prev.rubicOptimisation === next.rubicOptimisation &&
            prev.disableMultihops === next.disableMultihops
          );
        }),
        takeUntil(this.destroy$)
      )
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

  /**
   * Updates values, taken from form, and starts recalculation.
   */
  private setupSwapForm(form: SwapFormInput): void {
    this.fromAmount = form.fromAmount;
    this.fromToken = form.fromToken;
    this.toToken = form.toToken;

    this.isEth = {
      from: this.fromToken?.address === NATIVE_TOKEN_ADDRESS,
      to: this.toToken?.address === NATIVE_TOKEN_ADDRESS
    };

    this.ethAndWethTrade = this.instantTradeService.getEthAndWethTrade();
    this.allowRefreshChange.emit(!this.ethAndWethTrade);

    if (
      this.currentBlockchain !== form.fromBlockchain &&
      form.fromBlockchain === form.toBlockchain
    ) {
      this.currentBlockchain = form.fromBlockchain;
      this.initiateProviders(this.currentBlockchain);
    }

    this.conditionalCalculate('normal');
  }

  private initiateProviders(blockchain: BLOCKCHAIN_NAME): void {
    if (!InstantTradeService.isSupportedBlockchain(blockchain)) {
      this.errorService.catch(new NotSupportedItNetwork());
      return;
    }
    this.providersData = INSTANT_TRADE_PROVIDERS[blockchain];
  }

  public conditionalCalculate(type?: 'normal' | 'hidden'): void {
    if (
      this.tradeStatus === TRADE_STATUS.APPROVE_IN_PROGRESS ||
      this.tradeStatus === TRADE_STATUS.SWAP_IN_PROGRESS
    ) {
      return;
    }

    const { autoRefresh } = this.settingsService.instantTradeValue;
    this.onCalculateTrade$.next(type || (autoRefresh ? 'normal' : 'hidden'));
  }

  private setupCalculatingTrades(): void {
    if (this.calculateTradeSubscription$) {
      return;
    }

    this.calculateTradeSubscription$ = this.onCalculateTrade$
      .pipe(
        filter(type => type === 'normal'),
        debounceTime(200),
        switchMap(() => {
          if (!this.allowTrade) {
            this.setTradeStateIsNotAllowed();
            return of(null);
          }

          if (this.ethAndWethTrade) {
            this.setTradeStateIsEthWethSwap();
            return of(null);
          }

          this.setProvidersStateCalculating();
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);

          const providersNames = this.providersData.map(provider => provider.providerInfo.name);
          const approveData$ = this.authService.user?.address
            ? this.instantTradeService.getAllowance(providersNames)
            : of(new Array(this.providersData.length).fill(null));
          const tradeData$ = from(this.instantTradeService.calculateTrades(providersNames));
          const balance$ = from(
            this.tokensService.getAndUpdateTokenBalance(this.swapFormService.inputValue.fromToken)
          );

          return forkJoin([approveData$, tradeData$, balance$]).pipe(
            map(([approveData, tradeData]) => {
              this.setupProviders(tradeData, approveData);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.cdr.markForCheck();

        this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
      });
  }

  private setTradeStateIsNotAllowed(): void {
    this.tradeStatus = TRADE_STATUS.DISABLED;
    this.selectedProvider = null;
    this.isTradeSelectedByUser = false;

    this.swapFormService.output.patchValue({
      toAmount: new BigNumber(NaN)
    });
  }

  private setTradeStateIsEthWethSwap(): void {
    this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
    this.selectedProvider = null;
    this.isTradeSelectedByUser = false;
    this.needApprove = false;

    this.swapFormService.output.patchValue({
      toAmount: this.fromAmount
    });
  }

  private setupHiddenCalculatingTrades(): void {
    if (this.hiddenCalculateTradeSubscription$) {
      return;
    }

    this.hiddenCalculateTradeSubscription$ = this.onCalculateTrade$
      .pipe(
        filter(type => type === 'hidden' && Boolean(this.authService.userAddress)),
        switchMap(() => {
          if (!this.allowTrade) {
            return of(null);
          }

          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);

          const providersNames = this.providersData.map(provider => provider.providerInfo.name);
          const tradeData$ = from(this.instantTradeService.calculateTrades(providersNames));

          return tradeData$.pipe(
            map(tradeData => {
              return tradeData.map((trade: CalculationResult, index: number) => {
                if (trade.status === 'fulfilled') {
                  return {
                    amount: trade.value.to.amount,
                    name: providersNames[index]
                  };
                }
                return {
                  amount: null,
                  name: providersNames[index],
                  error: trade.reason
                };
              });
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(tradeData => {
        if (tradeData && this.selectedProvider) {
          this.hiddenDataAmounts$.next(tradeData);
          const hiddenProviderData = tradeData.find(
            (it: { name: INSTANT_TRADE_PROVIDER }) =>
              it.name === this.selectedProvider.providerInfo.name
          );
          if (!this.selectedProvider.trade.to.amount.eq(hiddenProviderData.amount)) {
            this.tradeStatus = TRADE_STATUS.OLD_TRADE_DATA;
          }

          this.cdr.markForCheck();

          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
        }
      });
  }

  private setProvidersStateCalculating(): void {
    this.tradeStatus = TRADE_STATUS.LOADING;
    this.providersData = this.providersData.map(controller => ({
      ...controller,
      tradeState: INSTANT_TRADE_STATUS.CALCULATION
    }));
    this.cdr.detectChanges();
  }

  /**
   * Sets to providers calculated trade data, approve data and trade status.
   * @param tradeData Calculated trade data.
   * @param approveData Calculated info about whether provider must be approved or not.
   */
  private setupProviders(tradeData: CalculationResult[], approveData: Array<boolean | null>): void {
    this.providersData = this.providersData.map((controller, index) => {
      const trade = tradeData[index]?.status === 'fulfilled' ? tradeData[index]?.value : null;
      return {
        ...controller,
        isSelected: false,
        trade,
        needApprove: approveData[index],
        tradeState:
          tradeData[index]?.status === 'fulfilled' && trade
            ? INSTANT_TRADE_STATUS.APPROVAL
            : INSTANT_TRADE_STATUS.ERROR,
        error: tradeData[index]?.status === 'rejected' ? tradeData[index]?.reason : null
      };
    });

    this.chooseBestProvider();
  }

  /**
   * Selects the best provider and updates trade status.
   */
  private chooseBestProvider(): void {
    this.sortProviders();
    const bestProvider = this.providersData[0];

    if (bestProvider.trade) {
      this.selectProviderAfterCalculation();

      this.tradeStatus = this.selectedProvider.needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
      this.needApprove = this.selectedProvider.needApprove;

      this.swapFormService.output.patchValue({
        toAmount: this.selectedProvider.trade.to.amount
      });
    } else {
      this.tradeStatus = TRADE_STATUS.DISABLED;
      this.instantTradeInfoChange.emit(null);
      this.swapInfoService.emitInfoCalculated();
      if (this.providersData.length === 1) {
        this.selectedProvider = null;
      }
    }
  }

  /**
   * Sorts providers based on usd price.
   */
  private sortProviders(): void {
    this.providersData.sort((providerA, providerB) => {
      return this.calculateTradeProfit(providerB.trade).comparedTo(
        this.calculateTradeProfit(providerA.trade)
      );
    });
  }

  private calculateTradeProfit(trade: InstantTrade): BigNumber {
    if (!trade) {
      return new BigNumber(0);
    }

    const { gasFeeInUsd, to } = trade;
    if (!to.token.price) {
      return to.amount;
    }
    const amountInUsd = to.amount?.multipliedBy(to.token.price);
    return amountInUsd.minus(gasFeeInUsd || 0);
  }

  /**
   * Focuses on provider after calculation. If user have selected provider, keeps old index,
   * otherwise selects the best one.
   */
  private selectProviderAfterCalculation(): void {
    if (!this.isTradeSelectedByUser) {
      this.selectedProvider = this.providersData[0];
      this.providersData[0].isSelected = true;
    } else {
      const currentSelectedProviderIndex = this.providersData.findIndex(
        el => el.providerInfo.name === this.selectedProvider.providerInfo.name
      );

      this.selectedProvider = this.providersData[currentSelectedProviderIndex];
      if (!this.selectedProvider.trade) {
        this.selectedProvider = this.providersData[0];
        this.providersData[0].isSelected = true;
      } else {
        this.providersData[currentSelectedProviderIndex].isSelected = true;
      }
    }
  }

  /**
   * Focuses on provider selected by user.
   */
  public onSelectProvider(selectedProvider: InstantTradeProviderData): void {
    if (
      this.tradeStatus === TRADE_STATUS.LOADING ||
      this.tradeStatus === TRADE_STATUS.APPROVE_IN_PROGRESS ||
      this.tradeStatus === TRADE_STATUS.SWAP_IN_PROGRESS
    ) {
      return;
    }

    const providerName = selectedProvider.providerInfo.name;
    this.providersData = this.providersData.map(provider => {
      const isSelected = provider.providerInfo.name === providerName;
      return {
        ...provider,
        isSelected
      };
    });
    this.selectedProvider = this.providersData.find(provider => provider.isSelected);
    this.isTradeSelectedByUser = true;

    if (this.selectedProvider.needApprove !== null) {
      this.tradeStatus = this.selectedProvider.needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
      this.needApprove = this.selectedProvider.needApprove;
    }
    this.swapFormService.output.patchValue({
      toAmount: this.selectedProvider.trade.to.amount
    });
  }

  /**
   * Returns usd cost of output token amount.
   */
  public getUsdPriceOfToAmount(toAmount?: BigNumber): BigNumber {
    toAmount ||= this.toAmount;
    if (!toAmount.isFinite() || !this.toToken) {
      return null;
    }
    if (!this.toToken?.price) {
      return new BigNumber(NaN);
    }

    const fromTokenCost = this.fromAmount.multipliedBy(this.fromToken?.price);
    const toTokenCost = toAmount.multipliedBy(this.toToken.price);
    if (toTokenCost.minus(fromTokenCost).dividedBy(fromTokenCost).gt(PERMITTED_PRICE_DIFFERENCE)) {
      return new BigNumber(NaN);
    }
    return toTokenCost;
  }

  /**
   * Sets trade and provider's state during approve or swap.
   */
  private setProviderState(
    tradeStatus: TRADE_STATUS,
    providerIndex: number,
    providerState?: INSTANT_TRADE_STATUS,
    needApprove?: boolean
  ): void {
    needApprove ??= this.providersData[providerIndex].needApprove;

    this.tradeStatus = tradeStatus;
    this.providersData[providerIndex] = {
      ...this.providersData[providerIndex],
      ...(providerState && { tradeState: providerState }),
      needApprove
    };
  }

  public async approveTrade(): Promise<void> {
    const providerIndex = this.providersData.findIndex(el => el.isSelected);
    if (providerIndex === -1) {
      this.errorService.catch(new NoSelectedProviderError());
    }

    const provider = this.providersData[providerIndex];
    this.setProviderState(TRADE_STATUS.APPROVE_IN_PROGRESS, providerIndex);

    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    try {
      await this.instantTradeService.approve(provider.providerInfo.name, provider.trade);

      this.setProviderState(
        TRADE_STATUS.READY_TO_SWAP,
        providerIndex,
        INSTANT_TRADE_STATUS.COMPLETED,
        false
      );
      this.needApprove = false;
      this.cdr.detectChanges();

      this.gtmService.updateFormStep(SWAP_PROVIDER_TYPE.INSTANT_TRADE, 'approve');
    } catch (err) {
      this.errorService.catch(err);

      this.setProviderState(
        TRADE_STATUS.READY_TO_APPROVE,
        providerIndex,
        INSTANT_TRADE_STATUS.APPROVAL,
        true
      );
      this.cdr.detectChanges();
    }

    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
  }

  public async createTrade(): Promise<void> {
    let providerIndex = -1;
    let instantTradeProvider: INSTANT_TRADE_PROVIDER;
    let instantTrade: InstantTrade;
    if (!this.ethAndWethTrade) {
      providerIndex = this.providersData.findIndex(el => el.isSelected);
      if (providerIndex === -1) {
        this.errorService.catch(new NoSelectedProviderError());
      }

      const provider = this.providersData[providerIndex];
      this.setProviderState(
        TRADE_STATUS.SWAP_IN_PROGRESS,
        providerIndex,
        INSTANT_TRADE_STATUS.TX_IN_PROGRESS
      );

      instantTradeProvider = provider.providerInfo.name;
      instantTrade = provider.trade;
    } else {
      this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
      instantTradeProvider = INSTANT_TRADE_PROVIDER.WRAPPED;
      instantTrade = this.ethAndWethTrade;
    }

    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    try {
      await this.instantTradeService.createTrade(instantTradeProvider, instantTrade, () => {
        if (providerIndex !== -1) {
          this.setProviderState(
            TRADE_STATUS.READY_TO_SWAP,
            providerIndex,
            INSTANT_TRADE_STATUS.COMPLETED
          );
        } else {
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
        }
        this.cdr.detectChanges();

        this.conditionalCalculate('hidden');
      });
    } catch (err) {
      this.errorService.catch(err);

      if (providerIndex !== -1) {
        this.setProviderState(
          TRADE_STATUS.READY_TO_SWAP,
          providerIndex,
          INSTANT_TRADE_STATUS.COMPLETED
        );
      } else {
        this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      }
      this.cdr.detectChanges();

      this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
    }
  }
}

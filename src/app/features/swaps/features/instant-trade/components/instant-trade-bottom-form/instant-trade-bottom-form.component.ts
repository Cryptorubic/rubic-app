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
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { InstantTradeService } from '@features/swaps/features/instant-trade/services/instant-trade-service/instant-trade.service';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_STATUS } from '@features/swaps/features/instant-trade/models/instant-trades-trade-status';
import { SwapFormInput } from '@features/swaps/features/swaps-form/models/swap-form';
import { INSTANT_TRADE_PROVIDERS } from '@features/swaps/features/instant-trade/constants/providers';
import { ErrorsService } from '@core/errors/errors.service';
import BigNumber from 'bignumber.js';
import { forkJoin, from, of, Subject, Subscription } from 'rxjs';
import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { AuthService } from '@core/services/auth/auth.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { NotSupportedItNetwork } from '@core/errors/models/instant-trade/not-supported-it-network';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
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
import { IframeService } from '@core/services/iframe/iframe.service';
import { InstantTradeProviderData } from '@features/swaps/features/instant-trade/models/providers-controller-data';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { InstantTradeInfo } from '@features/swaps/features/instant-trade/models/instant-trade-info';
import { PERMITTED_PRICE_DIFFERENCE } from '@shared/constants/common/permited-price-difference';
import { SwapInfoService } from '@features/swaps/features/swaps-form/components/swap-info/services/swap-info.service';
import NoSelectedProviderError from '@core/errors/models/instant-trade/no-selected-provider-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { IT_PROXY_FEE } from '@features/swaps/core/instant-trade/constants/iframe-proxy-fee-contract';
import { RefreshButtonService } from '@features/swaps/core/services/refresh-button-service/refresh-button.service';
import { REFRESH_BUTTON_STATUS } from '@features/swaps/core/services/refresh-button-service/models/refresh-button-status';

interface SettledProviderTrade {
  providerName: INSTANT_TRADE_PROVIDER;

  status: 'fulfilled' | 'rejected';
  value?: InstantTrade | null;
  reason?: RubicError<ERROR_TYPE>;

  needApprove?: boolean;
}

@Component({
  selector: 'app-instant-trade-bottom-form',
  templateUrl: './instant-trade-bottom-form.component.html',
  styleUrls: ['./instant-trade-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class InstantTradeBottomFormComponent implements OnInit {
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() favoriteTokens: AvailableTokenAmount[];

  /**
   * Emits info of currently selected trade.
   */
  @Output() instantTradeInfoChange = new EventEmitter<InstantTradeInfo>();

  @Output() tradeStatusChange = new EventEmitter<TRADE_STATUS>();

  public readonly TRADE_STATUS = TRADE_STATUS;

  private currentBlockchain: BlockchainName;

  private fromToken: TokenAmount;

  public toToken: TokenAmount;

  public fromAmount: BigNumber;

  private _tradeStatus: TRADE_STATUS;

  public providersData: InstantTradeProviderData[];

  private _selectedProvider: InstantTradeProviderData;

  public ethWethTrade: InstantTrade | null;

  public needApprove: boolean;

  /**
   * True, if 'approve' button should be shown near 'swap' button.
   */
  public withApproveButton: boolean;

  public isIframe: boolean;

  /**
   * True, if user clicked on provider.
   */
  private isTradeSelectedByUser = false;

  private readonly onCalculateTrade$ = new Subject<'normal' | 'hidden'>();

  private hiddenProvidersTrades: SettledProviderTrade[] | null;

  private calculateTradeSubscription$: Subscription;

  private hiddenCalculateTradeSubscription$: Subscription;

  public get selectedProvider(): InstantTradeProviderData {
    return this._selectedProvider;
  }

  public set selectedProvider(selectedProvider: InstantTradeProviderData) {
    this._selectedProvider = selectedProvider;
    this.instantTradeInfoChange.emit({
      trade: selectedProvider?.trade,
      isWrappedType: !!this.ethWethTrade
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

    if (!this.iframeService.isIframeWithFee(this.currentBlockchain, this.selectedProvider.name)) {
      return this.selectedProvider.trade.to.amount;
    }

    return this.selectedProvider.trade.to.amount.multipliedBy(1 - IT_PROXY_FEE);
  }

  public get isFromNative(): boolean {
    return this.publicBlockchainAdapterService[this.currentBlockchain].isNativeAddress(
      this.fromToken.address
    );
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapFormService: SwapFormService,
    private readonly instantTradeService: InstantTradeService,
    private readonly errorService: ErrorsService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly settingsService: SettingsService,
    private readonly iframeService: IframeService,
    private readonly swapInfoService: SwapInfoService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly refreshButtonService: RefreshButtonService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.isIframe = this.iframeService.isIframe;
  }

  public ngOnInit(): void {
    this.setupNormalTradesCalculation();
    this.setupHiddenTradesCalculation();

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

    this.refreshButtonService.status$
      .pipe(
        filter(
          status =>
            status === REFRESH_BUTTON_STATUS.REFRESHING && this.tradeStatus !== TRADE_STATUS.LOADING
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.conditionalCalculate();
      });
  }

  /**
   * Updates values, taken from form, and starts recalculation.
   */
  private setupSwapForm(form: SwapFormInput): void {
    this.fromAmount = form.fromAmount;
    this.fromToken = form.fromToken;
    this.toToken = form.toToken;

    this.ethWethTrade = this.instantTradeService.getEthWethTrade();
    if (this.ethWethTrade) {
      this.refreshButtonService.setDisabled();
    }

    if (
      this.currentBlockchain !== form.fromBlockchain &&
      form.fromBlockchain === form.toBlockchain
    ) {
      this.currentBlockchain = form.fromBlockchain;
      this.initiateProviders(this.currentBlockchain);
    }

    this.conditionalCalculate('normal');
  }

  private initiateProviders(blockchain: BlockchainName): void {
    if (!InstantTradeService.isSupportedBlockchain(blockchain)) {
      this.errorService.catch(new NotSupportedItNetwork());
      return;
    }
    this.providersData = INSTANT_TRADE_PROVIDERS[blockchain];
  }

  /**
   * Makes additional checks and starts `normal` or `hidden` calculation.
   */
  private conditionalCalculate(type?: 'normal' | 'hidden'): void {
    if (
      this.tradeStatus === TRADE_STATUS.APPROVE_IN_PROGRESS ||
      this.tradeStatus === TRADE_STATUS.SWAP_IN_PROGRESS
    ) {
      return;
    }

    const { autoRefresh } = this.settingsService.instantTradeValue;
    this.onCalculateTrade$.next(type || (autoRefresh ? 'normal' : 'hidden'));
  }

  private setupNormalTradesCalculation(): void {
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

          if (this.ethWethTrade) {
            this.setTradeStateIsEthWethSwap();
            return of(null);
          }

          this.setProvidersStateCalculating();
          this.refreshButtonService.startLoading();

          const providersNames = this.providersData.map(provider => provider.name);
          const providersApproveData$ = this.authService.user?.address
            ? this.instantTradeService.getAllowance(providersNames)
            : of(new Array(this.providersData.length).fill(null));
          const providersTrades$ = this.instantTradeService.calculateTrades(providersNames);
          const tokenBalance$ = this.tokensService.getAndUpdateTokenBalance(this.fromToken);

          return forkJoin([providersApproveData$, providersTrades$, tokenBalance$]).pipe(
            map(([providersApproveData, providersTrades]) => {
              this.hiddenProvidersTrades = null;

              const settledProvidersTrades = providersTrades.map((trade, index) => ({
                providerName: providersNames[index],
                ...trade,
                needApprove: providersApproveData[index]
              }));
              this.setupProviders(settledProvidersTrades);

              this.refreshButtonService.stopLoading();
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.cdr.markForCheck();
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
    this.withApproveButton = this.needApprove;

    this.swapFormService.output.patchValue({
      toAmount: this.fromAmount
    });
  }

  private setProvidersStateCalculating(): void {
    this.tradeStatus = TRADE_STATUS.LOADING;
    this.providersData = this.providersData.map(controller => ({
      ...controller,
      tradeStatus: INSTANT_TRADE_STATUS.CALCULATION
    }));
    this.cdr.detectChanges();
  }

  /**
   * Sets to providers calculated trade data, approve data and trade status.
   * @param settledProvidersTrades Calculated providers' trade data.
   * If not provided, current approve data is chosen.
   */
  private setupProviders(settledProvidersTrades: SettledProviderTrade[]): void {
    this.providersData = this.providersData.map(provider => {
      const settledProviderTrade = settledProvidersTrades.find(
        trade => trade.providerName === provider.name
      );
      const providerTrade =
        settledProviderTrade?.status === 'fulfilled' ? settledProviderTrade?.value : null;

      return {
        ...provider,
        isSelected: false,
        trade: providerTrade,
        needApprove: settledProviderTrade.needApprove ?? provider.needApprove,
        tradeStatus:
          settledProviderTrade?.status === 'fulfilled'
            ? INSTANT_TRADE_STATUS.APPROVAL
            : INSTANT_TRADE_STATUS.ERROR,
        error: settledProviderTrade?.status === 'rejected' ? settledProviderTrade?.reason : null
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
      this.withApproveButton = this.needApprove;

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
      return new BigNumber(-Infinity);
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
        provider => provider.name === this.selectedProvider.name
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

  private setupHiddenTradesCalculation(): void {
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

          const providersNames = this.providersData.map(provider => provider.name);
          const providersTrades$ = from(this.instantTradeService.calculateTrades(providersNames));

          return providersTrades$.pipe(
            map(providersTrades => {
              this.hiddenProvidersTrades = providersTrades.map((trade, index) => ({
                providerName: providersNames[index],
                ...trade
              }));
              this.checkSelectedProviderHiddenData();

              this.cdr.markForCheck();

              this.refreshButtonService.stopLoading();
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
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

    const providerName = selectedProvider.name;
    this.providersData = this.providersData.map(provider => ({
      ...provider,
      isSelected: provider.name === providerName
    }));
    this.selectedProvider = this.providersData.find(provider => provider.isSelected);
    this.isTradeSelectedByUser = true;

    if (this.selectedProvider.needApprove !== null) {
      this.tradeStatus = this.selectedProvider.needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
      this.needApprove = this.selectedProvider.needApprove;
      this.withApproveButton = this.needApprove;
    }
    this.swapFormService.output.patchValue({
      toAmount: this.selectedProvider.trade.to.amount
    });

    this.checkSelectedProviderHiddenData();
  }

  private checkSelectedProviderHiddenData(): void {
    if (this.hiddenProvidersTrades && this.selectedProvider?.trade) {
      const providerData = this.hiddenProvidersTrades.find(
        trade => trade.providerName === this.selectedProvider.name
      );
      const providerAmount =
        providerData.status === 'fulfilled' ? providerData.value.to.amount : null;

      if (!this.selectedProvider.trade.to.amount.eq(providerAmount)) {
        this.tradeStatus = TRADE_STATUS.OLD_TRADE_DATA;
      }
    }
  }

  /**
   * Updates trade data with stored hidden data, after user clicked on update button.
   */
  public onSetHiddenData(): void {
    this.setupProviders(this.hiddenProvidersTrades);
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
   * Sets trade and provider's statuses during approve or swap.
   */
  private setProviderState(
    providerName: INSTANT_TRADE_PROVIDER,
    tradeStatus: TRADE_STATUS,
    providerState?: INSTANT_TRADE_STATUS,
    needApprove?: boolean
  ): void {
    this.tradeStatus = tradeStatus;

    this.providersData = this.providersData.map(providerData => {
      if (providerData.name !== providerName) {
        return providerData;
      }
      return {
        ...providerData,
        ...(providerState && { tradeStatus: providerState }),
        ...(needApprove !== undefined && { needApprove: needApprove })
      };
    });

    if (needApprove !== undefined) {
      this.needApprove = needApprove;
    }
  }

  public async approveTrade(): Promise<void> {
    if (!this.selectedProvider) {
      this.errorService.catch(new NoSelectedProviderError());
    }

    this.setProviderState(this.selectedProvider.name, TRADE_STATUS.APPROVE_IN_PROGRESS);

    this.refreshButtonService.startLoading();

    const provider = this.selectedProvider;
    try {
      await this.instantTradeService.approve(this.selectedProvider.name, provider.trade);

      this.setProviderState(
        provider.name,
        TRADE_STATUS.READY_TO_SWAP,
        INSTANT_TRADE_STATUS.COMPLETED,
        false
      );

      this.gtmService.updateFormStep(SWAP_PROVIDER_TYPE.INSTANT_TRADE, 'approve');

      await this.tokensService.updateNativeTokenBalance(provider.trade.blockchain);
    } catch (err) {
      this.errorService.catch(err);

      this.setProviderState(
        provider.name,
        TRADE_STATUS.READY_TO_APPROVE,
        INSTANT_TRADE_STATUS.APPROVAL,
        true
      );
    }
    this.cdr.detectChanges();

    this.refreshButtonService.stopLoading();
  }

  public async createTrade(): Promise<void> {
    let providerName: INSTANT_TRADE_PROVIDER;
    let providerTrade: InstantTrade;
    if (!this.ethWethTrade) {
      if (!this.selectedProvider) {
        this.errorService.catch(new NoSelectedProviderError());
      }

      providerName = this.selectedProvider.name;
      providerTrade = this.selectedProvider.trade;
    } else {
      providerName = INSTANT_TRADE_PROVIDER.WRAPPED;
      providerTrade = this.ethWethTrade;
    }

    this.setProviderState(
      providerName,
      TRADE_STATUS.SWAP_IN_PROGRESS,
      INSTANT_TRADE_STATUS.TX_IN_PROGRESS
    );

    this.refreshButtonService.startLoading();

    try {
      await this.instantTradeService.createTrade(providerName, providerTrade, () => {
        this.setProviderState(
          providerName,
          TRADE_STATUS.READY_TO_SWAP,
          INSTANT_TRADE_STATUS.COMPLETED
        );
        this.cdr.detectChanges();
      });

      this.conditionalCalculate('hidden');

      await this.tokensService.updateTokenBalanceAfterSwap({
        address: providerTrade.from.token.address,
        blockchain: providerTrade.blockchain
      });
    } catch (err) {
      this.errorService.catch(err);

      this.setProviderState(
        providerName,
        TRADE_STATUS.READY_TO_SWAP,
        INSTANT_TRADE_STATUS.COMPLETED
      );
      this.cdr.detectChanges();

      this.refreshButtonService.stopLoading();
    }
  }
}

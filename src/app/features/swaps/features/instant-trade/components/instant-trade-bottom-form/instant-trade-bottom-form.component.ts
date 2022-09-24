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
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { InstantTradeService } from '@features/swaps/features/instant-trade/services/instant-trade-service/instant-trade.service';
import {
  BlockchainName,
  BlockchainsInfo,
  InstantTrade,
  InstantTradeError,
  TRADE_TYPE,
  TradeType,
  Web3Pure
} from 'rubic-sdk';
import { INSTANT_TRADE_STATUS } from '@features/swaps/features/instant-trade/models/instant-trades-trade-status';
import { SwapFormInput } from '@features/swaps/features/main-form/models/swap-form';
import { INSTANT_TRADE_PROVIDERS } from '@features/swaps/features/instant-trade/constants/providers';
import { ErrorsService } from '@core/errors/errors.service';
import BigNumber from 'bignumber.js';
import { forkJoin, from, of, Subject, Subscription } from 'rxjs';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { AuthService } from '@core/services/auth/auth.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { NotSupportedItNetwork } from '@core/errors/models/instant-trade/not-supported-it-network';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { REFRESH_BUTTON_STATUS } from '@shared/components/rubic-refresh-button/rubic-refresh-button.component';
import { IframeService } from '@core/services/iframe/iframe.service';
import { InstantTradeProviderData } from '@features/swaps/features/instant-trade/models/providers-controller-data';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { InstantTradeInfo } from '@features/swaps/features/instant-trade/models/instant-trade-info';
import { PERMITTED_PRICE_DIFFERENCE } from '@shared/constants/common/permited-price-difference';
import { SwapInfoService } from '@features/swaps/features/main-form/components/swap-info/services/swap-info.service';
import NoSelectedProviderError from '@core/errors/models/instant-trade/no-selected-provider-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { IT_PROXY_FEE } from '@features/swaps/features/instant-trade/services/instant-trade-service/constants/iframe-proxy-fee-contract';
import WrapTrade from '@features/swaps/features/instant-trade/models/wrap-trade';
import { TradeParser } from '@features/swaps/features/instant-trade/services/instant-trade-service/utils/trade-parser';
import { TargetNetworkAddressService } from '@features/swaps/shared/target-network-address/services/target-network-address.service';

interface SettledProviderTrade {
  providerName: TradeType;

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

  private currentBlockchain: BlockchainName;

  private fromToken: TokenAmount;

  public toToken: TokenAmount;

  public fromAmount: BigNumber;

  private _tradeStatus: TRADE_STATUS;

  public providersData: InstantTradeProviderData[];

  private _selectedProvider: InstantTradeProviderData;

  public ethWethTrade: WrapTrade | null;

  public needApprove: boolean;

  public readonly displayTargetAddressInput$ = this.settingsService.instantTradeValueChanges.pipe(
    startWith(this.settingsService.instantTradeValue),
    map(value => value.showReceiverAddress)
  );

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

  public toBlockchain: BlockchainName;

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
      return this.selectedProvider.trade.to.tokenAmount;
    }

    return this.selectedProvider.trade.to.tokenAmount.multipliedBy(1 - IT_PROXY_FEE);
  }

  public get isFromNative(): boolean {
    return Web3Pure[BlockchainsInfo.getChainType(this.fromToken.blockchain)].isNativeAddress(
      this.fromToken.address
    );
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    public readonly swapFormService: SwapFormService,
    private readonly instantTradeService: InstantTradeService,
    private readonly errorService: ErrorsService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly settingsService: SettingsService,
    private readonly iframeService: IframeService,
    private readonly swapInfoService: SwapInfoService,
    private readonly gtmService: GoogleTagManagerService,
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
            prev.disableMultihops === next.disableMultihops &&
            prev.slippageTolerance === next.slippageTolerance
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.conditionalCalculate('normal');
      });

    this.authService.currentUser$
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

  /**
   * Updates values, taken from form, and starts recalculation.
   */
  private setupSwapForm(form: SwapFormInput): void {
    this.fromAmount = form.fromAmount;
    this.fromToken = form.fromToken;
    this.toToken = form.toToken;
    this.toBlockchain = form.toBlockchain;

    this.ethWethTrade = this.instantTradeService.getEthWethTrade();
    this.allowRefreshChange.emit(!this.ethWethTrade);

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
  private conditionalCalculate(type: 'normal' | 'hidden'): void {
    if (
      this.tradeStatus === TRADE_STATUS.APPROVE_IN_PROGRESS ||
      this.tradeStatus === TRADE_STATUS.SWAP_IN_PROGRESS
    ) {
      return;
    }
    this.onCalculateTrade$.next(type);
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
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);

          const instantTrades$ = this.instantTradeService.calculateTrades(
            this.fromToken,
            this.fromAmount.toFixed(),
            this.toToken
          );

          const tokenBalance$ = this.tokensService.getAndUpdateTokenBalance(this.fromToken);

          return forkJoin([instantTrades$, tokenBalance$]).pipe(
            switchMap(([instantTrades]) => {
              this.hiddenProvidersTrades = null;
              return this.setupProviders(instantTrades);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
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
   * @param trades Calculated providers' trade data.
   * If not provided, current approve data is chosen.
   */
  private async setupProviders(trades: Array<InstantTrade | InstantTradeError>): Promise<void> {
    const providersPromises = this.providersData.map(async provider => {
      const settledTrade = trades.find(trade => trade?.type === provider.name);

      const defaultProvider: InstantTradeProviderData = {
        name: provider.name,
        label: provider.label,
        isSelected: false,
        needApprove: false,
        trade: null,
        tradeStatus: INSTANT_TRADE_STATUS.ERROR,
        error: new RubicError('There are not enough liquidity for this swap using chosen DEX.')
      };
      if (!settledTrade) {
        return defaultProvider;
      }
      if ('error' in settledTrade) {
        return {
          ...defaultProvider,
          error: settledTrade.error as RubicError<ERROR_TYPE.TEXT>
        };
      }

      const needApprove = this.authService.user?.address
        ? await this.instantTradeService.needApprove(settledTrade)
        : false;

      return {
        ...provider,
        isSelected: false,
        trade: settledTrade,
        needApprove,
        tradeStatus: INSTANT_TRADE_STATUS.APPROVAL,
        error: null
      };
    });

    this.providersData = await Promise.all(providersPromises);
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
        toAmount: this.selectedProvider.trade.to.tokenAmount
      });
      this.cdr.detectChanges();
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
    const { gasFeeInfo, to } = trade;
    if (!to.price.isFinite()) {
      return to.tokenAmount;
    }
    const amountInUsd = to?.tokenAmount.multipliedBy(to.price);
    return amountInUsd.minus(gasFeeInfo?.gasFeeInUsd || 0);
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

          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);

          const instantTrades$ = this.instantTradeService.calculateTrades(
            this.fromToken,
            this.fromAmount.toFixed(),
            this.toToken
          );

          return from(instantTrades$).pipe(
            switchMap(instantTrades => this.getHiddenTradeAndApproveData(instantTrades)),
            tap(hiddenTrades => {
              this.hiddenProvidersTrades = hiddenTrades;
              this.checkSelectedProviderHiddenData();
              this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
            }),
            watch(this.cdr)
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
      toAmount: this.selectedProvider.trade.to.tokenAmount
    });

    this.checkSelectedProviderHiddenData();
  }

  private checkSelectedProviderHiddenData(): void {
    if (this.hiddenProvidersTrades && this.selectedProvider?.trade) {
      const providerData = this.hiddenProvidersTrades.find(
        trade => trade.providerName === this.selectedProvider.name
      );
      const providerAmount =
        providerData.status === 'fulfilled' ? providerData.value.to.tokenAmount : null;

      if (!this.selectedProvider.trade.to.tokenAmount.eq(providerAmount)) {
        this.tradeStatus = TRADE_STATUS.OLD_TRADE_DATA;
      }
    }
  }

  /**
   * Updates trade data with stored hidden data, after user clicked on update button.
   */
  public onSetHiddenData(): void {
    this.setupProviders(this.hiddenProvidersTrades?.map(el => el.value));
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
    providerName: TradeType,
    tradeStatus: TRADE_STATUS,
    providerState?: INSTANT_TRADE_STATUS,
    needApprove?: boolean,
    isSelected?: boolean
  ): void {
    this.tradeStatus = tradeStatus;

    this.providersData = this.providersData.map(providerData => {
      if (providerData.name !== providerName) {
        return providerData;
      }
      return {
        ...providerData,
        ...(providerState && { tradeStatus: providerState }),
        ...(needApprove !== undefined && { needApprove: needApprove }),
        ...(isSelected && { isSelected })
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
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);
    const provider = this.selectedProvider;
    try {
      await this.instantTradeService.approve(provider.trade);

      this.setProviderState(
        provider.name,
        TRADE_STATUS.READY_TO_SWAP,
        INSTANT_TRADE_STATUS.COMPLETED,
        false,
        true
      );
      this.isTradeSelectedByUser = true;

      this.gtmService.updateFormStep(SWAP_PROVIDER_TYPE.INSTANT_TRADE, 'approve');
      await this.tokensService.updateNativeTokenBalance(provider.trade.from.blockchain);
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

    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
  }

  public async createTrade(): Promise<void> {
    let providerName: TradeType;
    let providerTrade: InstantTrade | WrapTrade;
    if (!this.ethWethTrade) {
      if (!this.selectedProvider) {
        this.errorService.catch(new NoSelectedProviderError());
      }

      providerName = this.selectedProvider.name;
      providerTrade = this.selectedProvider.trade;
    } else {
      providerName = TRADE_TYPE.WRAPPED;
      providerTrade = this.ethWethTrade;
    }

    this.setProviderState(
      providerName,
      TRADE_STATUS.SWAP_IN_PROGRESS,
      INSTANT_TRADE_STATUS.TX_IN_PROGRESS
    );

    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

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

      const { fromAddress, blockchain, toAddress } = TradeParser.getItSwapParams(providerTrade);

      await this.tokensService.updateTokenBalancesAfterItSwap(
        {
          address: fromAddress,
          blockchain
        },
        {
          address: toAddress,
          blockchain
        }
      );
    } catch (err) {
      this.errorService.catch(err);

      this.setProviderState(
        providerName,
        TRADE_STATUS.READY_TO_SWAP,
        INSTANT_TRADE_STATUS.COMPLETED
      );
      this.cdr.detectChanges();

      this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
    }
  }

  private async getHiddenTradeAndApproveData(
    instantTrades: Array<InstantTrade | InstantTradeError>
  ): Promise<SettledProviderTrade[]> {
    const approveData: Array<boolean | null> = await Promise.all(
      instantTrades.map(trade => ('error' in trade ? null : trade.needApprove()))
    );
    return instantTrades.map((trade, index) => {
      if ('error' in trade) {
        return {
          providerName: trade.type,
          value: null,
          status: 'rejected',
          reason: new RubicError(trade.error.message)
        };
      }
      return {
        providerName: trade.type,
        value: trade,
        status: 'fulfilled',
        needApprove: approveData?.[index]
      };
    });
  }
}

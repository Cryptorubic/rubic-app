import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Injector,
  INJECTOR,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { InstantTradeService } from '@features/swaps/features/instant-trade/services/instant-trade-service/instant-trade.service';
import {
  BlockchainName,
  BlockchainsInfo,
  EvmOnChainTrade,
  ON_CHAIN_TRADE_TYPE,
  OnChainTrade,
  OnChainTradeError,
  OnChainTradeType,
  Web3Pure
} from 'rubic-sdk';
import { INSTANT_TRADE_STATUS } from '@features/swaps/features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADE_PROVIDERS } from '@features/swaps/features/instant-trade/constants/providers';
import { ErrorsService } from '@core/errors/errors.service';
import BigNumber from 'bignumber.js';
import { forkJoin, from, of, Subject, Subscription } from 'rxjs';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { AuthService } from '@core/services/auth/auth.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
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
import { IframeService } from '@core/services/iframe/iframe.service';
import { InstantTradeProviderData } from '@features/swaps/features/instant-trade/models/providers-controller-data';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { InstantTradeInfo } from '@features/swaps/features/instant-trade/models/instant-trade-info';
import { SwapInfoService } from '@features/swaps/features/swap-form/components/swap-info/services/swap-info.service';
import NoSelectedProviderError from '@core/errors/models/instant-trade/no-selected-provider-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import WrapTrade from '@features/swaps/features/instant-trade/models/wrap-trade';
import { TradeParser } from '@features/swaps/features/instant-trade/services/instant-trade-service/utils/trade-parser';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { RubicSdkErrorParser } from '@core/errors/models/rubic-sdk-error-parser';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { AutoSlippageWarningModalComponent } from '@shared/components/via-slippage-warning-modal/auto-slippage-warning-modal.component';
import { TuiDialogService } from '@taiga-ui/core';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';
import { SupportedOnChainNetworks } from '@features/swaps/features/instant-trade/constants/instant-trade.type';

interface SettledProviderTrade {
  providerName: OnChainTradeType;

  status: 'fulfilled' | 'rejected';
  value?: OnChainTrade | null;
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

  public errorText: string;

  /**
   * True, if user clicked on provider.
   */
  private isTradeSelectedByUser = false;

  private readonly onCalculateTrade$ = new Subject<'normal' | 'hidden'>();

  private hiddenProvidersTrades: SettledProviderTrade[] | null;

  private calculateTradeSubscription$: Subscription;

  private hiddenCalculateTradeSubscription$: Subscription;

  public toBlockchain: BlockchainName;

  public readonly isOnramper$ = this.queryParamsService.queryParams$.pipe(
    map(queryParams => Boolean(queryParams.onramperTxId))
  );

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
    const form = this.instantTradeService.inputValue;

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

    return this.selectedProvider.trade.to.tokenAmount;
  }

  public get isFromNative(): boolean {
    return Web3Pure[BlockchainsInfo.getChainType(this.fromToken.blockchain)].isNativeAddress(
      this.fromToken.address
    );
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly swapFormService: SwapFormService,
    private readonly instantTradeService: InstantTradeService,
    private readonly errorService: ErrorsService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly settingsService: SettingsService,
    private readonly iframeService: IframeService,
    private readonly swapInfoService: SwapInfoService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly queryParamsService: QueryParamsService,
    private readonly dialogService: TuiDialogService,
    private readonly refreshService: RefreshService,
    @Inject(INJECTOR) private readonly injector: Injector,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.isIframe = this.iframeService.isIframe;
  }

  public ngOnInit(): void {
    this.setupNormalTradesCalculation();
    this.setupHiddenTradesCalculation();

    this.tradeStatus = TRADE_STATUS.DISABLED;

    this.swapFormService.inputValueDistinct$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.setupSwapForm();
    });

    this.swapFormService.toToken$.pipe(takeUntil(this.destroy$)).subscribe(toToken => {
      if (
        TokensService.areTokensEqual(this.toToken, toToken) &&
        this.toToken?.price !== toToken?.price
      ) {
        this.toToken = toToken;
        this.cdr.markForCheck();
      }
    });

    this.settingsService.instantTradeValueChanges
      .pipe(
        distinctUntilChanged((prev, next) => {
          return (
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

    this.refreshService.onRefresh$.pipe(takeUntil(this.destroy$)).subscribe(({ isForced }) => {
      this.conditionalCalculate(
        isForced || this.settingsService.instantTradeValue.autoRefresh ? 'normal' : 'hidden'
      );
    });
  }

  private isSupportedOnChainNetwork(
    blockchain: BlockchainName
  ): blockchain is SupportedOnChainNetworks {
    return Object.keys(INSTANT_TRADE_PROVIDERS).some(
      supportedNetwork => supportedNetwork === blockchain
    );
  }

  /**
   * Updates values, taken from form, and starts recalculation.
   */
  private setupSwapForm(): void {
    const { fromAssetType, toBlockchain } = this.swapFormService.inputValue;
    if (!BlockchainsInfo.isBlockchainName(fromAssetType) || fromAssetType !== toBlockchain) {
      return;
    }

    const form = this.instantTradeService.inputValue;
    this.fromAmount = form.fromAmount;
    this.fromToken = form.fromToken;
    this.toToken = form.toToken;
    this.toBlockchain = form.toBlockchain;

    if (
      !this.isSupportedOnChainNetwork(form.fromBlockchain) &&
      this.fromAmount &&
      this.fromAmount.gt(0)
    ) {
      this.errorText = 'Chosen network is not supported for instant trades';
    } else {
      this.errorText = '';
    }

    this.ethWethTrade = this.instantTradeService.getEthWethTrade();
    this.allowRefreshChange.emit(!this.ethWethTrade);

    if (
      this.currentBlockchain !== form.fromBlockchain &&
      form.fromBlockchain === form.toBlockchain
    ) {
      this.currentBlockchain = form.fromBlockchain;
      const isSuccessful = this.initiateProviders(this.currentBlockchain);
      if (!isSuccessful) {
        return;
      }
    }

    this.conditionalCalculate('normal');
  }

  private initiateProviders(blockchain: BlockchainName): boolean {
    if (!this.isSupportedOnChainNetwork(blockchain)) {
      this.providersData = [];
      return false;
    }
    this.providersData = INSTANT_TRADE_PROVIDERS[blockchain];
    return true;
  }

  /**
   * Makes additional checks and starts `normal` or `hidden` calculation.
   */
  private conditionalCalculate(type: 'normal' | 'hidden'): void {
    const { fromBlockchain, toBlockchain } = this.instantTradeService.inputValue;
    if (fromBlockchain !== toBlockchain) {
      return;
    }

    if (
      fromBlockchain !== toBlockchain ||
      !this.isSupportedOnChainNetwork(this.currentBlockchain as SupportedOnChainNetworks) ||
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
          if (!this.swapFormService.isFilled) {
            this.setTradeStateIsNotAllowed();
            return of(null);
          }

          if (this.ethWethTrade) {
            this.setTradeStateIsEthWethSwap();
            return of(null);
          }

          this.setProvidersStateCalculating();
          this.refreshService.setRefreshing();

          const disableInstantTrade =
            this.queryParamsService.disabledProviders && this.queryParamsService.enabledBlockchains;

          const instantTrades$ = disableInstantTrade
            ? this.getFakeTrades()
            : this.instantTradeService.calculateTrades(
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
        this.refreshService.setStopped();
        this.cdr.markForCheck();
      });
  }

  private setTradeStateIsNotAllowed(): void {
    this.tradeStatus = TRADE_STATUS.DISABLED;
    this.selectedProvider = null;
    this.isTradeSelectedByUser = false;

    this.swapFormService.outputControl.patchValue({
      toAmount: new BigNumber(NaN)
    });
  }

  private setTradeStateIsEthWethSwap(): void {
    this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
    this.selectedProvider = null;
    this.isTradeSelectedByUser = false;
    this.needApprove = false;
    this.withApproveButton = this.needApprove;

    this.swapFormService.outputControl.patchValue({
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
  private async setupProviders(trades: Array<OnChainTrade | OnChainTradeError>): Promise<void> {
    const isUserAuthorized =
      Boolean(this.authService.userAddress) &&
      this.authService.userChainType === BlockchainsInfo.getChainType(this.fromToken.blockchain);

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
          error: RubicSdkErrorParser.parseError(settledTrade.error)
        };
      }

      const needApprove = isUserAuthorized
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

      this.swapFormService.outputControl.patchValue({
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

  private calculateTradeProfit(trade: OnChainTrade): BigNumber {
    if (!trade) {
      return new BigNumber(-Infinity);
    }
    const { to } = trade;
    if (!to.price.isFinite()) {
      return to.tokenAmount;
    }

    const amountInUsd = to?.tokenAmount.multipliedBy(to.price);
    const gasFeeInfo =
      trade instanceof EvmOnChainTrade && trade.gasFeeInfo?.gasFeeInUsd?.isFinite()
        ? trade.gasFeeInfo.gasFeeInUsd
        : 0;

    return amountInUsd.minus(gasFeeInfo);
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
          if (!this.swapFormService.isFilled) {
            return of(null);
          }

          this.refreshService.setRefreshing();

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

              this.refreshService.setStopped();
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
    this.swapFormService.outputControl.patchValue({
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
        providerData?.status === 'fulfilled' ? providerData.value.to.tokenAmount : null;

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
   * Sets trade and provider's statuses during approve or swap.
   */
  private setProviderState(
    providerName: OnChainTradeType,
    tradeStatus: TRADE_STATUS,
    providerState?: INSTANT_TRADE_STATUS,
    needApprove?: boolean,
    isSelected?: boolean
  ): void {
    this.tradeStatus = tradeStatus;
    const trade = this.providersData.find(
      providerData => providerData.name === providerName
    )?.trade;
    const isProxy = trade instanceof EvmOnChainTrade && trade.useProxy;

    this.providersData = this.providersData.map(providerData => {
      if (providerData.name !== providerName) {
        if (!isProxy) {
          return providerData;
        }
        return {
          ...providerData,
          ...(needApprove !== undefined && { needApprove: needApprove })
        };
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
    this.refreshService.startInProgress();
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

    this.refreshService.stopInProgress();
  }

  public async createTrade(): Promise<void> {
    if (!this.isSlippageCorrect()) {
      return;
    }

    if (
      !this.ethWethTrade &&
      !(await this.settingsService.checkSlippageAndPriceImpact(
        SWAP_PROVIDER_TYPE.INSTANT_TRADE,
        this.selectedProvider.trade
      ))
    ) {
      return;
    }

    let providerName: OnChainTradeType;
    let providerTrade: OnChainTrade | WrapTrade;
    if (!this.ethWethTrade) {
      if (!this.selectedProvider) {
        this.errorService.catch(new NoSelectedProviderError());
      }

      providerName = this.selectedProvider.name;
      providerTrade = this.selectedProvider.trade;
    } else {
      providerName = ON_CHAIN_TRADE_TYPE.WRAPPED;
      providerTrade = this.ethWethTrade;
    }

    this.setProviderState(
      providerName,
      TRADE_STATUS.SWAP_IN_PROGRESS,
      INSTANT_TRADE_STATUS.TX_IN_PROGRESS
    );

    this.refreshService.startInProgress();

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
    }

    this.refreshService.stopInProgress();
  }

  private async getHiddenTradeAndApproveData(
    instantTrades: Array<OnChainTrade | OnChainTradeError>
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

  private getFakeTrades(): Promise<OnChainTradeError[]> {
    return new Promise<OnChainTradeError[]>(resolve =>
      resolve(
        this.providersData.map(provider => ({
          type: provider.name,
          error: new RubicError('Instant trade is not supported')
        }))
      )
    );
  }

  private isSlippageCorrect(): boolean {
    if (
      !this.selectedProvider ||
      this.settingsService.instantTradeValue.autoSlippageTolerance ||
      this.selectedProvider.trade.type !== ON_CHAIN_TRADE_TYPE.BRIDGERS
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

  public getGas(selectedProvider: InstantTradeProviderData): BigNumber {
    const trade = selectedProvider.trade;
    return trade instanceof EvmOnChainTrade && trade.gasFeeInfo?.gasFeeInUsd
      ? trade.gasFeeInfo.gasFeeInUsd
      : new BigNumber(0);
  }
}

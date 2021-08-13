import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { InstantTradeService } from 'src/app/features/instant-trade/services/instant-trade-service/instant-trade.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { INSTANT_TRADES_STATUS } from 'src/app/features/instant-trade/models/instant-trades-trade-status';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { INSTANT_TRADE_PROVIDERS } from 'src/app/features/instant-trade/constants/providers';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import BigNumber from 'bignumber.js';
import NoSelectedProviderError from 'src/app/core/errors/models/instant-trade/no-selected-provider.error';
import { forkJoin, from, Observable, of, Subject, Subscription } from 'rxjs';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { NotSupportedItNetwork } from 'src/app/core/errors/models/instant-trade/not-supported-it-network';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { defaultSlippageTolerance } from 'src/app/features/instant-trade/constants/defaultSlippageTolerance';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { map, startWith, switchMap } from 'rxjs/operators';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { REFRESH_BUTTON_STATUS } from 'src/app/shared/components/rubic-refresh-button/rubic-refresh-button.component';
import { BIG_NUMBER_FORMAT } from 'src/app/shared/constants/formats/BIG_NUMBER_FORMAT';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

interface CalculationResult {
  status: 'fulfilled' | 'rejected';
  value?: InstantTrade | null;
  reason?: Error;
}

@Component({
  selector: 'app-instant-trade-bottom-form',
  templateUrl: './instant-trade-bottom-form.component.html',
  styleUrls: ['./instant-trade-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstantTradeBottomFormComponent implements OnInit, OnDestroy {
  @Input() onRefreshTrade: Subject<void>;

  @Output() onRefreshStatusChange = new EventEmitter<REFRESH_BUTTON_STATUS>();

  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() formService: FormService;

  private readonly unsupportedItNetworks: BLOCKCHAIN_NAME[];

  private readonly onCalculateTrade: Subject<void>;

  private providerControllers: ProviderControllerData[];

  public selectedProvider: ProviderControllerData;

  private providersOrderCache: INSTANT_TRADES_PROVIDER[];

  private currentBlockchain: BLOCKCHAIN_NAME;

  private fromToken: TokenAmount;

  private toToken: TokenAmount;

  public fromAmount: BigNumber;

  public tradeStatus: TRADE_STATUS;

  public needApprove: boolean;

  private settingsForm: ItSettingsForm;

  private formChangesSubscription$: Subscription;

  private settingsFormSubscription$: Subscription;

  private refreshTradeSubscription$: Subscription;

  private userSubscription$: Subscription;

  private calculateTradeSubscription$: Subscription;

  get allowTrade(): boolean {
    const form = this.swapFormService.inputValue;
    return Boolean(
      form.fromBlockchain &&
        form.fromToken &&
        form.toBlockchain &&
        form.toToken &&
        form.fromAmount &&
        form.fromAmount.gt(0)
    );
  }

  get orderedProviders(): ProviderControllerData[] {
    if (
      !this.providersOrderCache?.length ||
      this.providerControllers.some(item => item.isBestRate)
    ) {
      this.providersOrderCache = [...this.providerControllers]
        .sort(item => (item.isBestRate ? -1 : 1))
        .map(item => item.tradeProviderInfo.value);
    }
    return this.providersOrderCache.map(providerName =>
      this.providerControllers.find(provider => provider.tradeProviderInfo.value === providerName)
    );
  }

  constructor(
    public readonly swapFormService: SwapFormService,
    private readonly instantTradeService: InstantTradeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly errorService: ErrorsService,
    private readonly authService: AuthService,
    private readonly web3PublicService: Web3PublicService,
    private readonly tokensService: TokensService,
    private readonly settingsService: SettingsService
  ) {
    this.unsupportedItNetworks = [BLOCKCHAIN_NAME.TRON, BLOCKCHAIN_NAME.XDAI];
    this.onCalculateTrade = new Subject<void>();
  }

  public ngOnInit(): void {
    this.setupCalculatingTrades();
    this.tradeStatus = TRADE_STATUS.DISABLED;

    this.formChangesSubscription$ = this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue))
      .subscribe(form => this.setupSwapForm(form));

    this.settingsFormSubscription$ = this.settingsService.instantTradeValueChanges
      .pipe(startWith(this.settingsService.instantTradeValue))
      .subscribe(form => this.setupSettingsForm(form));

    this.userSubscription$ = this.authService.getCurrentUser().subscribe(user => {
      if (user?.address) {
        this.conditionalCalculate();
      }
    });

    this.refreshTradeSubscription$ = this.onRefreshTrade.subscribe(() =>
      this.conditionalCalculate()
    );
  }

  ngOnDestroy() {
    this.formChangesSubscription$.unsubscribe();
    this.settingsFormSubscription$.unsubscribe();
    this.userSubscription$.unsubscribe();
    this.refreshTradeSubscription$.unsubscribe();
  }

  private setupSwapForm(form: SwapFormInput): void {
    if (
      this.currentBlockchain === form.fromBlockchain &&
      this.fromAmount &&
      this.fromAmount.eq(form.fromAmount) &&
      this.tokensService.isOnlyBalanceUpdated(this.fromToken, form.fromToken) &&
      this.tokensService.isOnlyBalanceUpdated(this.toToken, form.toToken)
    ) {
      return;
    }

    this.fromAmount = form.fromAmount;
    this.fromToken = form.fromToken;
    this.toToken = form.toToken;

    if (
      this.currentBlockchain !== form.fromBlockchain &&
      form.fromBlockchain === form.toBlockchain
    ) {
      this.currentBlockchain = form.fromBlockchain;
      this.initiateProviders(this.currentBlockchain);
    }
    this.cdr.detectChanges();

    if (!this.allowTrade) {
      this.tradeStatus = TRADE_STATUS.DISABLED;
      this.selectedProvider = null;
      this.cdr.detectChanges();
      return;
    }

    this.conditionalCalculate();
  }

  private initiateProviders(blockchain: BLOCKCHAIN_NAME) {
    this.providersOrderCache = null;
    switch (blockchain) {
      case BLOCKCHAIN_NAME.ETHEREUM:
        this.providerControllers = INSTANT_TRADE_PROVIDERS[BLOCKCHAIN_NAME.ETHEREUM];
        break;
      case BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN:
        this.providerControllers = INSTANT_TRADE_PROVIDERS[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
        break;
      case BLOCKCHAIN_NAME.POLYGON:
        this.providerControllers = INSTANT_TRADE_PROVIDERS[BLOCKCHAIN_NAME.POLYGON];
        break;
      default:
        this.errorService.catch(new NotSupportedItNetwork());
    }
  }

  private setupSettingsForm(form: ItSettingsForm): void {
    let needRecalculation = false;
    if (
      this.settingsForm &&
      (this.settingsForm.rubicOptimisation !== form.rubicOptimisation ||
        this.settingsForm.disableMultihops !== form.disableMultihops) &&
      this.tradeStatus !== TRADE_STATUS.APPROVE_IN_PROGRESS &&
      this.tradeStatus !== TRADE_STATUS.SWAP_IN_PROGRESS
    ) {
      needRecalculation = true;
    }

    if (
      this.settingsForm &&
      this.settingsForm.autoSlippageTolerance !== form.autoSlippageTolerance
    ) {
      const providerIndex = this.providerControllers.findIndex(el => el.isSelected);
      if (providerIndex !== -1) {
        setTimeout(() => {
          this.setSlippageTolerance(this.providerControllers[providerIndex]);
        });
      }
    }
    this.settingsForm = form;

    if (needRecalculation) {
      this.conditionalCalculate();
    }
  }

  private conditionalCalculate(): void {
    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;

    if (fromBlockchain !== toBlockchain) {
      return;
    }
    if (this.unsupportedItNetworks.includes(toBlockchain)) {
      this.errorService.catch(new NotSupportedItNetwork());
      this.cdr.detectChanges();
      return;
    }
    if (
      !this.allowTrade ||
      this.tradeStatus === TRADE_STATUS.APPROVE_IN_PROGRESS ||
      this.tradeStatus === TRADE_STATUS.SWAP_IN_PROGRESS
    ) {
      return;
    }

    this.onCalculateTrade.next();
  }

  private setupCalculatingTrades(): void {
    if (this.calculateTradeSubscription$) {
      return;
    }

    this.calculateTradeSubscription$ = this.onCalculateTrade
      .pipe(
        switchMap(() => {
          this.prepareControllers();
          this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.REFRESHING);

          const providersNames = this.providerControllers.map(
            provider => provider.tradeProviderInfo.value
          );
          const approveDataObservable = this.authService.user?.address
            ? this.instantTradeService.getApprove(providersNames)
            : of(new Array(this.providerControllers.length).fill(null));
          const tradeDataObservable = from(
            this.instantTradeService.calculateTrades(providersNames)
          );

          return forkJoin([approveDataObservable, tradeDataObservable]).pipe(
            map(([approveData, tradeData]) => {
              this.setupControllers(tradeData, approveData);
              this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
            })
          );
        })
      )
      .subscribe();
  }

  private prepareControllers(): void {
    this.tradeStatus = TRADE_STATUS.LOADING;
    this.providerControllers = this.providerControllers.map(controller => ({
      ...controller,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      isBestRate: false
    }));
    this.cdr.detectChanges();
  }

  private setupControllers(
    tradeData: CalculationResult[],
    approveData: Array<boolean | null>
  ): void {
    const newProviders = this.providerControllers.map((controller, index) => ({
      ...controller,
      isSelected: false,
      trade: tradeData[index]?.status === 'fulfilled' ? (tradeData as unknown)[index]?.value : null,
      isBestRate: false,
      needApprove: approveData[index],
      tradeState:
        tradeData[index]?.status === 'fulfilled' && tradeData[index]?.value
          ? INSTANT_TRADES_STATUS.APPROVAL
          : INSTANT_TRADES_STATUS.ERROR,
      error: tradeData[index]?.status === 'rejected' ? (tradeData as unknown)[index]?.reason : null
    }));
    this.providerControllers = newProviders;

    const bestProviderIndex = this.calculateBestRate(tradeData.map(el => el.value));
    if (bestProviderIndex !== -1) {
      newProviders[bestProviderIndex].isBestRate = true;
      newProviders[bestProviderIndex].isSelected = true;

      this.selectedProvider = newProviders[bestProviderIndex];

      this.tradeStatus = this.selectedProvider.needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
      this.needApprove = this.selectedProvider.needApprove;

      this.setSlippageTolerance(this.selectedProvider);
    } else {
      this.tradeStatus = TRADE_STATUS.DISABLED;
    }
    this.cdr.detectChanges();
  }

  private calculateBestRate(tradeData: InstantTrade[]): number {
    const { index: providerIndex } = tradeData.reduce(
      (bestRate, trade, i: number) => {
        if (!trade) {
          return bestRate;
        }
        const { gasFeeInUsd, to } = trade;
        const amountInUsd = to.amount?.multipliedBy(to.token.price);

        if (amountInUsd) {
          const profit = gasFeeInUsd ? amountInUsd.minus(gasFeeInUsd) : amountInUsd;
          return profit.gt(bestRate.profit)
            ? {
                index: i,
                profit
              }
            : bestRate;
        }
        return bestRate;
      },
      {
        index: -1,
        profit: new BigNumber(-Infinity)
      }
    );

    return providerIndex;
  }

  public selectProvider(selectedProvider: ProviderControllerData): void {
    if (
      this.tradeStatus === TRADE_STATUS.LOADING ||
      this.tradeStatus === TRADE_STATUS.APPROVE_IN_PROGRESS ||
      this.tradeStatus === TRADE_STATUS.SWAP_IN_PROGRESS
    ) {
      return;
    }

    const providerName = selectedProvider.tradeProviderInfo.value;
    this.providerControllers = this.providerControllers.map(provider => {
      const isSelected = provider.tradeProviderInfo.value === providerName;
      return {
        ...provider,
        isSelected
      };
    });
    this.selectedProvider = this.providerControllers.find(provider => provider.isSelected);

    if (this.selectedProvider.needApprove !== null) {
      this.tradeStatus = this.selectedProvider.needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
      this.needApprove = this.selectedProvider.needApprove;
    }
    this.cdr.detectChanges();

    this.setSlippageTolerance(this.selectedProvider);
  }

  private setSlippageTolerance(provider: ProviderControllerData) {
    const providerName = provider.tradeProviderInfo.value;
    if (this.settingsService.instantTradeValue.autoSlippageTolerance) {
      this.settingsService.instantTrade.patchValue({
        slippageTolerance: defaultSlippageTolerance[this.currentBlockchain][providerName]
      });
    }
  }

  public getUsdPrice(): string {
    const tradeTo = this.selectedProvider.trade.to;
    return tradeTo.amount.multipliedBy(tradeTo.token.price).toFormat(2, BIG_NUMBER_FORMAT);
  }

  private setProviderState(
    tradeStatus: TRADE_STATUS,
    providerIndex: number,
    providerState: INSTANT_TRADES_STATUS,
    needApprove?: boolean
  ): void {
    if (needApprove === undefined) {
      needApprove = this.providerControllers[providerIndex].needApprove;
    }

    this.tradeStatus = tradeStatus;
    this.providerControllers[providerIndex] = {
      ...this.providerControllers[providerIndex],
      tradeState: providerState,
      needApprove
    };
    this.cdr.detectChanges();
  }

  public async approveTrade(): Promise<void> {
    const providerIndex = this.providerControllers.findIndex(el => el.isSelected);
    if (providerIndex === -1) {
      this.errorService.catch(new NoSelectedProviderError());
    }

    const provider = this.providerControllers[providerIndex];
    this.setProviderState(
      TRADE_STATUS.APPROVE_IN_PROGRESS,
      providerIndex,
      INSTANT_TRADES_STATUS.TX_IN_PROGRESS
    );
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    try {
      await this.instantTradeService.approve(provider.tradeProviderInfo.value, provider.trade);

      this.tokensService.recalculateUsersBalance();

      this.setProviderState(
        TRADE_STATUS.READY_TO_SWAP,
        providerIndex,
        INSTANT_TRADES_STATUS.COMPLETED,
        false
      );
    } catch (err) {
      this.errorService.catch(err);

      this.setProviderState(
        TRADE_STATUS.READY_TO_APPROVE,
        providerIndex,
        INSTANT_TRADES_STATUS.APPROVAL,
        true
      );
    }
    this.cdr.detectChanges();
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
  }

  public async createTrade(): Promise<void> {
    const providerIndex = this.providerControllers.findIndex(el => el.isSelected);
    if (providerIndex === -1) {
      this.errorService.catch(new NoSelectedProviderError());
    }

    const provider = this.providerControllers[providerIndex];
    this.setProviderState(
      TRADE_STATUS.SWAP_IN_PROGRESS,
      providerIndex,
      INSTANT_TRADES_STATUS.TX_IN_PROGRESS
    );
    this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.IN_PROGRESS);

    try {
      await this.instantTradeService.createTrade(provider.tradeProviderInfo.value, provider.trade);

      this.tokensService.recalculateUsersBalance();

      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      this.conditionalCalculate();
    } catch (err) {
      this.errorService.catch(err);

      this.setProviderState(
        TRADE_STATUS.READY_TO_SWAP,
        providerIndex,
        INSTANT_TRADES_STATUS.COMPLETED
      );
      this.cdr.detectChanges();
      this.onRefreshStatusChange.emit(REFRESH_BUTTON_STATUS.STOPPED);
    }
  }
}

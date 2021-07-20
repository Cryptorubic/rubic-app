import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { InstantTradeService } from 'src/app/features/instant-trade/services/instant-trade-service/instant-trade.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { INSTANT_TRADES_STATUS } from 'src/app/features/instant-trade/models/instant-trades-trade-status';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { ControlsValue } from '@ngneat/reactive-forms/lib/types';
import { INSTANT_TRADE_PROVIDERS } from 'src/app/features/instant-trade/constants/providers';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import BigNumber from 'bignumber.js';
import NoSelectedProviderError from 'src/app/core/errors/models/instant-trade/no-selected-provider.error';
import { Subscription } from 'rxjs';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { NotSupportedItNetwork } from 'src/app/core/errors/models/instant-trade/not-supported-it-network';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

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
  private readonly unsupportedItNetworks: BLOCKCHAIN_NAME[];

  public get allowTrade(): boolean {
    const form = this.swapFormService.commonTrade.controls.input.value;
    return Boolean(
      form.fromBlockchain &&
        form.fromToken &&
        form.toBlockchain &&
        form.toToken &&
        form.fromAmount &&
        form.fromAmount.gt(0)
    );
  }

  public get isProviderSelected(): boolean {
    return !this.providerControllers.some(el => el.isSelected);
  }

  get tokenInfoUrl(): string {
    const { fromToken, toToken } = this.swapFormService.commonTrade.controls.input.value;
    let tokenAddress;
    if (
      toToken?.address &&
      toToken.address !== NATIVE_TOKEN_ADDRESS &&
      this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM].isAddressCorrect(toToken.address)
    ) {
      tokenAddress = toToken?.address;
    } else {
      tokenAddress = fromToken?.address;
    }
    return tokenAddress ? `t/${tokenAddress}` : '';
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

  private providersOrderCache: INSTANT_TRADES_PROVIDER[];

  public formChangesSubscription$: Subscription;

  public providerControllers: ProviderControllerData[];

  private currentBlockchain: BLOCKCHAIN_NAME;

  public fromAmount: BigNumber;

  public tradeStatus: TRADE_STATUS;

  public needApprove: boolean;

  constructor(
    public readonly swapFormService: SwapFormService,
    private readonly instantTradeService: InstantTradeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly errorService: ErrorsService,
    private readonly authService: AuthService,
    private readonly web3PublicService: Web3PublicService,
    private readonly tokensService: TokensService
  ) {
    this.unsupportedItNetworks = [BLOCKCHAIN_NAME.TRON, BLOCKCHAIN_NAME.XDAI];
    this.tradeStatus = TRADE_STATUS.DISABLED;
  }

  public ngOnInit(): void {
    const formValue = this.swapFormService.commonTrade.controls.input.value;
    this.fromAmount = formValue.fromAmount;
    this.currentBlockchain = formValue.toBlockchain;
    this.initiateProviders(this.currentBlockchain);
    this.conditionalCalculate(formValue);

    this.formChangesSubscription$ =
      this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(form => {
        this.fromAmount = form.fromAmount;
        this.cdr.detectChanges();

        this.setupForm(form);
      });
  }

  ngOnDestroy() {
    this.cdr.detach();
    this.formChangesSubscription$.unsubscribe();
  }

  private async conditionalCalculate(form: ControlsValue<SwapFormInput>): Promise<void> {
    if (form.fromBlockchain !== form.toBlockchain) {
      return;
    }
    if (this.unsupportedItNetworks.includes(form.toBlockchain)) {
      throw new NotSupportedItNetwork();
    }
    await this.calculateTrades();
  }

  public async calculateTrades(): Promise<void> {
    try {
      const form = this.swapFormService.commonTrade.controls.input.value;
      if (
        !(
          form.fromToken &&
          form.toToken &&
          form.fromBlockchain &&
          form.fromAmount &&
          form.toBlockchain &&
          form.fromAmount.gt(0)
        )
      ) {
        return;
      }

      this.prepareControllers();
      const approveData = this.authService.user?.address
        ? await this.instantTradeService.getApprove().toPromise()
        : new Array(this.providerControllers.length).fill(null);
      const tradeData = (await this.instantTradeService.calculateTrades()) as CalculationResult[];

      const bestProviderIndex = this.calculateBestRate(tradeData.map(el => el.value));
      this.setupControllers(tradeData, approveData, bestProviderIndex);
    } catch (err) {
      this.errorService.catch$(err);
    }
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
    approveData: Array<boolean | null>,
    bestProviderIndex: number
  ): void {
    const newProviders = this.providerControllers.map((controller, index) => ({
      ...controller,
      isSelected:
        !controller.error && controller.isSelected && tradeData[index]?.status === 'fulfilled',
      trade: tradeData[index]?.status === 'fulfilled' ? (tradeData as unknown)[index]?.value : null,
      isBestRate: false,
      needApprove: approveData[index],
      tradeState:
        tradeData[index]?.status === 'fulfilled' && tradeData[index]?.value
          ? INSTANT_TRADES_STATUS.APPROVAL
          : INSTANT_TRADES_STATUS.ERROR,
      error: tradeData[index]?.status === 'rejected' ? (tradeData as unknown)[index]?.reason : null
    }));
    if (tradeData[bestProviderIndex].value && tradeData[bestProviderIndex].status !== 'rejected') {
      newProviders[bestProviderIndex].isBestRate = true;
    }

    this.providerControllers = newProviders;
    const selectedProviderIndex = newProviders.findIndex(el => el.isSelected);
    if (selectedProviderIndex !== -1) {
      const provider = this.providerControllers[selectedProviderIndex];
      this.tradeStatus = provider.needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
      this.needApprove = newProviders[selectedProviderIndex].needApprove;
    } else {
      this.tradeStatus = TRADE_STATUS.DISABLED;
    }
    this.cdr.detectChanges();
  }

  public async createTrade(): Promise<void> {
    const providerIndex = this.providerControllers.findIndex(el => el.isSelected);
    const provider = this.providerControllers[providerIndex];
    const currentTradeState = this.tradeStatus;

    if (providerIndex !== -1) {
      try {
        this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
        this.providerControllers[providerIndex] = {
          ...this.providerControllers[providerIndex],
          tradeState: INSTANT_TRADES_STATUS.TX_IN_PROGRESS
        };
        this.cdr.detectChanges();
        await this.instantTradeService.createTrade(
          provider.tradeProviderInfo.value,
          provider.trade
        );
        this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      } catch (err) {
        this.providerControllers[providerIndex] = {
          ...this.providerControllers[providerIndex],
          tradeState: INSTANT_TRADES_STATUS.ERROR
        };
        this.tradeStatus = currentTradeState;
      }
      this.providerControllers[providerIndex] = {
        ...this.providerControllers[providerIndex],
        tradeState: INSTANT_TRADES_STATUS.COMPLETED
      };
      this.tradeStatus = currentTradeState;
      this.cdr.detectChanges();

      await this.tokensService.recalculateUsersBalance();
    } else {
      this.errorService.throw$(new NoSelectedProviderError());
    }
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
        this.errorService.catch$(new NotSupportedItNetwork());
    }
  }

  public selectProvider(providerName: INSTANT_TRADES_PROVIDER): void {
    if (
      this.tradeStatus === TRADE_STATUS.LOADING ||
      this.tradeStatus === TRADE_STATUS.APPROVE_IN_PROGRESS ||
      this.tradeStatus === TRADE_STATUS.SWAP_IN_PROGRESS
    ) {
      return;
    }

    const newProviders = this.providerControllers.map(provider => {
      const isSelected = provider.tradeProviderInfo.value === providerName;
      return {
        ...provider,
        isSelected
      };
    });
    this.providerControllers = newProviders;
    const currentProvider = newProviders.find(provider => provider.isSelected);

    if (currentProvider.needApprove !== null) {
      this.tradeStatus = currentProvider.needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
      this.needApprove = currentProvider.needApprove;
    }
  }

  private calculateBestRate(tradeData: InstantTrade[]): number {
    const { index: providerIndex } = tradeData.reduce(
      (bestRate, trade, i: number) => {
        if (!trade) {
          return bestRate;
        }
        const { gasFeeInUsd, to } = trade;
        const amountInUsd = to.amount?.multipliedBy(to.token.price);

        if (amountInUsd && gasFeeInUsd) {
          const profit = amountInUsd.minus(gasFeeInUsd);
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
        index: 0,
        profit: new BigNumber(-Infinity)
      }
    );

    return providerIndex;
  }

  public async approveTrade(): Promise<void> {
    const providerIndex = this.providerControllers.findIndex(el => el.isSelected);
    const provider = this.providerControllers[providerIndex];
    if (providerIndex !== -1) {
      this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
      this.providerControllers[providerIndex] = {
        ...this.providerControllers[providerIndex],
        tradeState: INSTANT_TRADES_STATUS.TX_IN_PROGRESS
      };
      this.cdr.detectChanges();

      try {
        await this.instantTradeService.approve(provider.tradeProviderInfo.value, provider.trade);
        this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
        this.providerControllers[providerIndex] = {
          ...this.providerControllers[providerIndex],
          tradeState: INSTANT_TRADES_STATUS.COMPLETED,
          needApprove: false
        };
        this.cdr.detectChanges();
      } catch (err) {
        this.providerControllers[providerIndex] = {
          ...this.providerControllers[providerIndex],
          tradeState: INSTANT_TRADES_STATUS.APPROVAL,
          needApprove: true
        };
        this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
        this.errorService.catch$(err);
      }
      this.cdr.detectChanges();
    } else {
      this.errorService.catch$(new NoSelectedProviderError());
    }
  }

  private async setupForm(form: ControlsValue<SwapFormInput>) {
    try {
      if (
        this.currentBlockchain !== form.fromBlockchain &&
        form.fromBlockchain === form.toBlockchain
      ) {
        this.currentBlockchain = form.fromBlockchain;
        this.initiateProviders(this.currentBlockchain);
      }
      if (!this.allowTrade) {
        this.tradeStatus = TRADE_STATUS.DISABLED;
        return;
      }
      await this.conditionalCalculate(form);
      this.cdr.detectChanges();
    } catch (err) {
      this.errorService.catch$(err);
    }
  }
}

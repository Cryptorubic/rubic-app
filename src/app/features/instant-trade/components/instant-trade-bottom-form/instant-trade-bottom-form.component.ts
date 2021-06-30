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
import { INSTANT_TRADES_STATUS } from 'src/app/features/swaps-page-old/instant-trades/models/instant-trades-trade-status';
import { SwapForm } from 'src/app/features/swaps/models/SwapForm';
import { ControlsValue } from '@ngneat/reactive-forms/lib/types';
import { INSTANT_TRADE_PROVIDERS } from 'src/app/features/instant-trade/constants/providers';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import BigNumber from 'bignumber.js';
import NoSelectedProviderError from 'src/app/core/errors/models/instant-trade/no-selected-provider.error';
import { Subscription } from 'rxjs';
import InstantTrade from 'src/app/features/swaps-page-old/instant-trades/models/InstantTrade';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import { RubicError } from 'src/app/core/errors/models/RubicError';

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

  get tokenInfoUrl(): string {
    const { fromToken, toToken } = this.swapFormService.commonTrade.controls.input.value;
    if (!fromToken?.address || !toToken?.address) {
      return '';
    }
    return `t/${toToken.address}`;
  }

  public formChangesSubscription$: Subscription;

  public providerControllers: ProviderControllerData[];

  private currentBlockchain: BLOCKCHAIN_NAME;

  public tradeStatus: TRADE_STATUS;

  public needApprove: boolean;

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly instantTradeService: InstantTradeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly errorService: ErrorsService,
    private readonly authService: AuthService
  ) {
    this.tradeStatus = TRADE_STATUS.DISABLED;
  }

  public ngOnInit(): void {
    const formValue = this.swapFormService.commonTrade.value;
    this.currentBlockchain = formValue.input.toBlockchain;
    this.initiateProviders(this.currentBlockchain);
    this.conditionalCalculate(formValue);

    this.formChangesSubscription$ = this.swapFormService.commonTrade.valueChanges.subscribe(
      form => {
        this.conditionalCalculate(form);
        if (
          this.currentBlockchain !== form.input.fromBlockchain &&
          form.input.fromBlockchain === form.input.toBlockchain
        ) {
          this.currentBlockchain = form.input.fromBlockchain;
          this.initiateProviders(this.currentBlockchain);
        }
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    this.formChangesSubscription$.unsubscribe();
  }

  private async conditionalCalculate(form: ControlsValue<SwapForm>): Promise<void> {
    if (form.input.fromBlockchain !== form.input.toBlockchain) {
      return;
    }

    if (
      form.input.fromToken &&
      form.input.toToken &&
      form.input.fromBlockchain &&
      form.input.fromAmount &&
      form.input.toBlockchain &&
      form.input.fromAmount.gt(0)
    ) {
      await this.calculateTrades();
    }
  }

  public async calculateTrades(): Promise<void> {
    const currentTradeStatus = this.tradeStatus;
    this.prepareControllers();
    const approveData = this.authService.user?.address
      ? await this.instantTradeService.getApprove().toPromise()
      : new Array(this.providerControllers.length).fill(null);
    const tradeData = (await this.instantTradeService.calculateTrades()) as CalculationResult[];

    const wrongTrades = tradeData.filter(el => el.status === 'rejected');
    wrongTrades.forEach(el => {
      this.errorService.catch$(el.reason as RubicError);
    });

    const bestProviderIndex = this.calculateBestRate(tradeData.map(el => el.value));
    this.setupControllers(tradeData, approveData, bestProviderIndex, currentTradeStatus);
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
    bestProviderIndex: number,
    currentTradeStatus: TRADE_STATUS
  ): void {
    const newProviders = this.providerControllers.map((controller, index) => ({
      ...controller,
      trade: tradeData[index]?.status === 'fulfilled' ? (tradeData as unknown)[index]?.value : null,
      isBestRate: false,
      needApprove: approveData[index],
      tradeState:
        tradeData[index]?.status === 'fulfilled' && tradeData[index]?.value
          ? INSTANT_TRADES_STATUS.APPROVAL
          : INSTANT_TRADES_STATUS.ERROR
    }));
    if (tradeData[bestProviderIndex].value && tradeData[bestProviderIndex].status !== 'rejected') {
      newProviders[bestProviderIndex].isBestRate = true;
    }

    this.providerControllers = newProviders;
    this.tradeStatus = newProviders.some(el => el.isSelected)
      ? currentTradeStatus
      : TRADE_STATUS.DISABLED;
    this.cdr.detectChanges();
  }

  public async createTrade(): Promise<void> {
    const providerIndex = this.providerControllers.findIndex(el => el.isSelected);
    const provider = this.providerControllers[providerIndex];
    if (providerIndex !== -1) {
      this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
      this.providerControllers[providerIndex] = {
        ...this.providerControllers[providerIndex],
        tradeState: INSTANT_TRADES_STATUS.TX_IN_PROGRESS
      };
      this.cdr.detectChanges();
      try {
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
        this.tradeStatus = TRADE_STATUS.DISABLED;
      }
      this.providerControllers[providerIndex] = {
        ...this.providerControllers[providerIndex],
        tradeState: INSTANT_TRADES_STATUS.COMPLETED
      };
      this.cdr.detectChanges();
    } else {
      this.errorService.throw$(new NoSelectedProviderError());
    }
  }

  private initiateProviders(blockchain: BLOCKCHAIN_NAME) {
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
        this.errorService.throw$(new UndefinedError());
    }
  }

  public selectProvider(providerNumber: number): void {
    const newProviders = this.providerControllers.map(provider => {
      return {
        ...provider,
        isSelected: false
      };
    });
    newProviders[providerNumber] = {
      ...newProviders[providerNumber],
      isSelected: true
    };
    this.providerControllers = newProviders;
    if (newProviders[providerNumber].needApprove !== null) {
      this.tradeStatus = newProviders[providerNumber].needApprove
        ? TRADE_STATUS.READY_TO_APPROVE
        : TRADE_STATUS.READY_TO_SWAP;
      this.needApprove = newProviders[providerNumber].needApprove;
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
      } catch (err) {
        this.providerControllers[providerIndex] = {
          ...this.providerControllers[providerIndex],
          tradeState: INSTANT_TRADES_STATUS.APPROVAL
        };
        this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
      }
      this.cdr.detectChanges();
    } else {
      this.errorService.throw$(new NoSelectedProviderError());
    }
  }
}

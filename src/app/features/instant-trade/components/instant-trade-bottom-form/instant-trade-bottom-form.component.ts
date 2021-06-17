import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { IToken } from 'src/app/shared/models/tokens/IToken';
import { InstantTradeService } from 'src/app/features/instant-trade/services/instant-trade-service/instant-trade.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { INSTANT_TRADES_STATUS } from 'src/app/features/swaps-page-old/instant-trades/models/instant-trades-trade-status';
import { SwapForm } from 'src/app/features/swaps/models/SwapForm';
import { ControlsValue } from '@ngneat/reactive-forms/lib/types';
import { INSTANT_TRADE_PROVIDERS } from 'src/app/features/instant-trade/constants/providers';

@Component({
  selector: 'app-instant-trade-bottom-form',
  templateUrl: './instant-trade-bottom-form.component.html',
  styleUrls: ['./instant-trade-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstantTradeBottomFormComponent implements OnInit {
  public get allowAnalyse(): boolean {
    return Boolean(this.swapFormService.commonTrade.controls.input.value.fromToken);
  }

  public providerControllers: ProviderControllerData[];

  private currentBlockchain: BLOCKCHAIN_NAME;

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly instantTradeService: InstantTradeService,
    private readonly cdr: ChangeDetectorRef
  ) {
    const formValue = this.swapFormService.commonTrade.value;
    this.currentBlockchain = formValue.input.toBlockchain;
    this.initiateProviders(this.currentBlockchain);
    this.conditionalCalculate(formValue);
  }

  public ngOnInit(): void {
    this.swapFormService.commonTrade.valueChanges.subscribe(form => {
      this.conditionalCalculate(form);
      if (
        this.currentBlockchain !== form.input.fromBlockchain &&
        form.input.fromBlockchain === form.input.toBlockchain
      ) {
        this.currentBlockchain = form.input.fromBlockchain;
        this.initiateProviders(this.currentBlockchain);
      }
    });
  }

  private async conditionalCalculate(form: ControlsValue<SwapForm>): Promise<void> {
    if (
      form.input.fromToken &&
      form.input.toToken &&
      form.input.fromBlockchain &&
      form.input.fromAmount &&
      form.input.toBlockchain
    ) {
      await this.calculateTrades();
    }
  }

  public async calculateTrades(): Promise<void> {
    const tradeData = (await this.instantTradeService.calculateTrades()) as any[];
    this.providerControllers = this.providerControllers.map((controller, index) => ({
      ...controller,
      trade: tradeData[index]?.value,
      tradeState:
        tradeData[index]?.status === 'fulfilled'
          ? INSTANT_TRADES_STATUS.APPROVAL
          : INSTANT_TRADES_STATUS.ERROR
    }));
    this.cdr.detectChanges();
  }

  public async createTrade(): Promise<void> {
    const provider = this.providerControllers.find(el => el.isSelected);
    if (provider) {
      await this.instantTradeService.createTrade(provider.tradeProviderInfo.value, provider.trade);
    } else {
      console.error('No provider selected');
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
        console.debug(`Blockchain ${blockchain} was not found.`);
    }
  }

  public collapseProvider(providerNumber: number, isCollapsed: boolean): void {
    const newProviders = [...this.providerControllers];
    newProviders[providerNumber] = {
      ...newProviders[providerNumber],
      isCollapsed
    };
    this.providerControllers = newProviders;
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
  }

  public getAnalytic() {
    const token = this.swapFormService.commonTrade.get('fromToken').value as IToken;
    window.open(`https://keks.app/t/${token.address}`, '_blank').focus();
  }
}

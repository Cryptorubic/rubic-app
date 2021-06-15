import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import { NewUiDataService } from 'src/app/features/new-ui/new-ui-data.service';
import { PROVIDERS } from 'src/app/features/swaps-page-old/instant-trades/models/providers.enum';

@Component({
  selector: 'app-instant-trade-bottom-form',
  templateUrl: './instant-trade-bottom-form.component.html',
  styleUrls: ['./instant-trade-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstantTradeBottomFormComponent {
  public providerControllers: ProviderControllerData[];

  constructor(public readonly store: NewUiDataService) {
    this.providerControllers = [store.providerControllers[0], store.providerControllers[2]];
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

  // private initInstantTradeProviders() {
  //   switch (this.blockchain) {
  //     case BLOCKCHAIN_NAME.ETHEREUM:
  //       this._instantTradeServices = [this.oneInchEthService, this.uniSwapService];
  //       this.trades = [
  //         {
  //           trade: null,
  //           tradeState: null,
  //           tradeProviderInfo: {
  //             label: '1inch',
  //             value: PROVIDERS.ONEINCH
  //           },
  //           isBestRate: false
  //         },
  //         {
  //           trade: null,
  //           tradeState: null,
  //           tradeProviderInfo: {
  //             label: 'Uniswap',
  //             value: PROVIDERS.UNISWAP
  //           },
  //           isBestRate: false
  //         }
  //       ];
  //       break;
  //     case BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN:
  //       this._instantTradeServices = [this.oneInchBscService, this.pancakeSwapService];
  //       this.trades = [
  //         {
  //           trade: null,
  //           tradeState: null,
  //           tradeProviderInfo: {
  //             label: '1inch',
  //             value: PROVIDERS.ONEINCH
  //           },
  //           isBestRate: false
  //         },
  //         {
  //           trade: null,
  //           tradeState: null,
  //           tradeProviderInfo: {
  //             label: 'Pancakeswap',
  //             value: PROVIDERS.PANCAKESWAP
  //           },
  //           isBestRate: false
  //         }
  //       ];
  //       break;
  //     case BLOCKCHAIN_NAME.POLYGON:
  //       this._instantTradeServices = [this.oneInchPolService, this.quickSwapService];
  //       this.trades = [
  //         {
  //           trade: null,
  //           tradeState: null,
  //           tradeProviderInfo: {
  //             label: '1inch',
  //             value: PROVIDERS.ONEINCH
  //           },
  //           isBestRate: false
  //         },
  //         {
  //           trade: null,
  //           tradeState: null,
  //           tradeProviderInfo: {
  //             label: 'Quickswap',
  //             value: PROVIDERS.QUICKSWAP
  //           },
  //           isBestRate: false
  //         }
  //       ];
  //       break;
  //     default:
  //       console.debug(`Blockchain ${this.blockchain} was not found.`);
  //   }
  //   this.setSlippagePercent(this.slippagePercent);
  //   [this.bestProvider] = this.trades;
  // }
}

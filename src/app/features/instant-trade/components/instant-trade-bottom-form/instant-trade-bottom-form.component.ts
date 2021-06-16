import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { IToken } from 'src/app/shared/models/tokens/IToken';
import { InstantTradeService } from 'src/app/features/instant-trade/services/instant-trade-service/instant-trade.service';
import { PROVIDERS } from 'src/app/features/swaps-page-old/instant-trades/models/providers.enum';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { INSTANT_TRADES_STATUS } from 'src/app/features/swaps-page-old/instant-trades/models/instant-trades-trade-status';

@Component({
  selector: 'app-instant-trade-bottom-form',
  templateUrl: './instant-trade-bottom-form.component.html',
  styleUrls: ['./instant-trade-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstantTradeBottomFormComponent {
  public get allowAnalyse(): boolean {
    return Boolean(this.swapFormService.commonTrade.get('fromToken').value);
  }

  public providerControllers: ProviderControllerData[];

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly instantTradeService: InstantTradeService,
    private readonly cdr: ChangeDetectorRef
  ) {
    const formValue = this.swapFormService.commonTrade.value;
    this.initiateProviders(formValue.toBlockchain);
    if (
      formValue.fromToken &&
      formValue.toToken &&
      formValue.fromBlockchain &&
      formValue.fromAmount &&
      formValue.toBlockchain
    ) {
      this.calculateTrades();
    }
    this.swapFormService.commonTrade.valueChanges.subscribe(form => {
      if (
        form.fromToken &&
        form.toToken &&
        form.fromBlockchain &&
        form.fromAmount &&
        form.toBlockchain
      ) {
        this.calculateTrades();
      }
    });
  }

  public async calculateTrades(): Promise<void> {
    const tradeData = (await this.instantTradeService.calculateTrades()) as any[];
    this.providerControllers = this.providerControllers.map((controller, index) => ({
      ...controller,
      trade: tradeData[index].value,
      tradeState: INSTANT_TRADES_STATUS.APPROVAL
    }));
    this.cdr.detectChanges();
  }

  private initiateProviders(blockchain: BLOCKCHAIN_NAME) {
    switch (blockchain) {
      case BLOCKCHAIN_NAME.ETHEREUM:
        this.providerControllers = [
          {
            trade: null,
            tradeState: INSTANT_TRADES_STATUS.CALCULATION,
            tradeProviderInfo: {
              label: '1inch',
              value: PROVIDERS.ONEINCH
            },
            isBestRate: false,
            isSelected: false,
            isCollapsed: false
          }
          // {
          //   trade: null,
          //   tradeState: null,
          //   tradeProviderInfo: {
          //     label: 'Uniswap',
          //     value: PROVIDERS.UNISWAP
          //   },
          //   isBestRate: false
          // }
        ];
        break;
      // case BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN:
      //   this._instantTradeServices = [this.oneInchBscService, this.pancakeSwapService];
      //   this.trades = [
      //     {
      //       trade: null,
      //       tradeState: null,
      //       tradeProviderInfo: {
      //         label: '1inch',
      //         value: PROVIDERS.ONEINCH
      //       },
      //       isBestRate: false
      //     },
      //     {
      //       trade: null,
      //       tradeState: null,
      //       tradeProviderInfo: {
      //         label: 'Pancakeswap',
      //         value: PROVIDERS.PANCAKESWAP
      //       },
      //       isBestRate: false
      //     }
      //   ];
      //   break;
      // case BLOCKCHAIN_NAME.POLYGON:
      //   this._instantTradeServices = [this.oneInchPolService, this.quickSwapService];
      //   this.trades = [
      //     {
      //       trade: null,
      //       tradeState: null,
      //       tradeProviderInfo: {
      //         label: '1inch',
      //         value: PROVIDERS.ONEINCH
      //       },
      //       isBestRate: false
      //     },
      //     {
      //       trade: null,
      //       tradeState: null,
      //       tradeProviderInfo: {
      //         label: 'Quickswap',
      //         value: PROVIDERS.QUICKSWAP
      //       },
      //       isBestRate: false
      //     }
      //   ];
      //   break;
      default:
      // console.debug(`Blockchain ${this.blockchain} was not found.`);
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
  public getAnalytic() {
    const token = this.swapFormService.commonTrade.get('fromToken').value as IToken;
    window.open(`https://keks.app/t/${token.address}`, '_blank').focus();
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { map, tap } from 'rxjs/operators';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { SwapFormQueryService } from '@features/trade/services/swap-form-query/swap-form-query.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { BlockchainsInfo, CROSS_CHAIN_TRADE_TYPE, ON_CHAIN_TRADE_TYPE } from 'rubic-sdk';
import { SwapTokensUpdaterService } from '@features/trade/services/swap-tokens-updater-service/swap-tokens-updater.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-trade-view-container',
  templateUrl: './trade-view-container.component.html',
  styleUrls: ['./trade-view-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-25%)', opacity: 0.5 }),
        animate('1s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 0.5, width: '360px' }),
        animate('0.2s ease-in', style({ transform: 'translateX(-25%)', opacity: 0, width: 0 }))
      ])
    ])
  ]
})
export class TradeViewContainerComponent {
  public readonly formContent$ = this.tradePageService.formContent$;

  // private timeout: NodeJS.Timeout;

  public readonly providers$ = this.swapsState.tradesStore$.pipe(
    tap(providers => {
      if (providers.length > 0 && providers[0].trade?.type !== ON_CHAIN_TRADE_TYPE.WRAPPED) {
        this.tradePageService.setProvidersVisibility(true);
      } else {
        this.tradePageService.setProvidersVisibility(false);
        //
        // if (!this.timeout) {
        //   this.timeout = setTimeout(() => {
        //     this.tradePageService.setProvidersVisibility(true);
        //     clearTimeout(this.timeout);
        //   }, 3_000);
        // }
      }
    }),
    map(providers => providers.filter(provider => provider.trade))
  );

  public readonly calculationProgress$ = this.swapsState.calculationProgress$;

  public readonly showProviders$ = this.tradePageService.showProviders$;

  public readonly selectedTradeType$ = this.swapsState.tradeState$.pipe(map(el => el.tradeType));

  constructor(
    private readonly swapsState: SwapsStateService,
    private readonly tradePageService: TradePageService,
    public readonly swapFormQueryService: SwapFormQueryService,
    public readonly swapFormService: SwapsFormService,
    public readonly swapTokensUpdaterService: SwapTokensUpdaterService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService
  ) {}

  public async selectTrade(tradeType: TradeProvider): Promise<void> {
    await this.swapsState.selectTrade(tradeType);
    const currentTrade = this.swapsState.currentTrade;
    // Handle ChangeNow Non EVM trade
    if (
      currentTrade?.trade?.type === CROSS_CHAIN_TRADE_TYPE.CHANGENOW &&
      !BlockchainsInfo.isEvmBlockchainName(currentTrade?.trade.from.blockchain)
    ) {
      const isAddressValid = await firstValueFrom(this.targetNetworkAddressService.isAddressValid$);
      if (isAddressValid) {
        this.tradePageService.setState('cnPreview');
      }
    } else {
      this.tradePageService.setState('preview');
    }
  }
}

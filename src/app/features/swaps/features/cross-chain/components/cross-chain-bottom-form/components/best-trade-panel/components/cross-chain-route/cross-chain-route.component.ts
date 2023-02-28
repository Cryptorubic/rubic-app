import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TRADES_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/trades-providers';
import { CrossChainRoute } from '@features/swaps/features/cross-chain/models/cross-chain-route';
import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';
import { centralizedBridges } from '@features/swaps/shared/constants/trades-providers/centralized-bridges';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';

@Component({
  selector: 'app-cross-chain-route',
  templateUrl: './cross-chain-route.component.html',
  styleUrls: ['./cross-chain-route.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossChainRouteComponent {
  @Input() set route(routing: CrossChainRoute) {
    this.bridgeProvider = CrossChainRouteComponent.getRoute(
      routing.bridgeProvider,
      routing.bridgeProvider
    );
    this.fromProvider = CrossChainRouteComponent.getRoute(
      routing?.fromProvider,
      routing.bridgeProvider
    );
    this.toProvider = CrossChainRouteComponent.getRoute(
      routing?.toProvider,
      routing.bridgeProvider
    );
  }

  public static getRoute(provider: TradeProvider, bridgeProvider: TradeProvider): ProviderInfo {
    const isCentralizedBridge = centralizedBridges.some(
      centralizedBridge => centralizedBridge === bridgeProvider
    );

    return provider
      ? {
          ...TRADES_PROVIDERS[provider],
          ...(isCentralizedBridge && { name: `${TRADES_PROVIDERS[provider].name} (Centralized)` })
        }
      : {
          ...TRADES_PROVIDERS[bridgeProvider],
          name: TRADES_PROVIDERS[bridgeProvider].name + ' Pool'
        };
  }

  public fromProvider: ProviderInfo;

  public bridgeProvider: ProviderInfo;

  public toProvider: ProviderInfo;

  constructor() {}
}

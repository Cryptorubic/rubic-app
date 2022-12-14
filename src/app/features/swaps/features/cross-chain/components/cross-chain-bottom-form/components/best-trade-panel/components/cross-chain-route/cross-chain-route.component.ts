import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TRADES_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/trades-providers';
import { CrossChainRoute } from '@features/swaps/features/cross-chain/models/cross-chain-route';
import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';

@Component({
  selector: 'app-cross-chain-route',
  templateUrl: './cross-chain-route.component.html',
  styleUrls: ['./cross-chain-route.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossChainRouteComponent {
  public fromProvider: ProviderInfo;

  public bridgeProvider: ProviderInfo;

  public toProvider: ProviderInfo;

  @Input() set route(routing: CrossChainRoute) {
    this.bridgeProvider = TRADES_PROVIDERS[routing.bridgeProvider];

    this.fromProvider = routing.fromProvider
      ? TRADES_PROVIDERS[routing.fromProvider]
      : {
          ...TRADES_PROVIDERS[routing.bridgeProvider],
          name: TRADES_PROVIDERS[routing.bridgeProvider].name + ' Pool'
        };
    this.toProvider = routing.toProvider
      ? TRADES_PROVIDERS[routing.toProvider]
      : {
          ...TRADES_PROVIDERS[routing.bridgeProvider],
          name: TRADES_PROVIDERS[routing.bridgeProvider].name + ' Pool'
        };
  }

  constructor() {}
}

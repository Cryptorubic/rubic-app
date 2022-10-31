import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Provider, TRADES_PROVIDERS } from '@shared/constants/common/trades-providers';
import { CrossChainRoute } from '@features/swaps/features/cross-chain/models/cross-chain-route';

@Component({
  selector: 'app-cross-chain-route',
  templateUrl: './cross-chain-route.component.html',
  styleUrls: ['./cross-chain-route.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossChainRouteComponent {
  public fromProvider: Provider;

  public bridgeProvider: Provider;

  public toProvider: Provider;

  @Input() set route(routing: CrossChainRoute) {
    this.bridgeProvider = this.tradesProviders[routing.bridgeProvider];
    this.fromProvider = routing.fromProvider
      ? this.tradesProviders[routing.fromProvider]
      : {
          ...this.tradesProviders[routing.bridgeProvider],
          name: this.tradesProviders[routing.bridgeProvider].name + ' Pool'
        };
    this.toProvider = routing.toProvider
      ? this.tradesProviders[routing.toProvider]
      : {
          ...this.tradesProviders[routing.bridgeProvider],
          name: this.tradesProviders[routing.bridgeProvider].name + ' Pool'
        };
  }

  public readonly tradesProviders = TRADES_PROVIDERS;

  constructor() {}
}

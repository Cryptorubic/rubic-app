import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { Provider, TRADES_PROVIDERS } from '@shared/constants/common/trades-providers';
import { SmartRouting } from '../../models/smart-routing.interface';

@Component({
  selector: 'app-smart-routing',
  templateUrl: './smart-routing.component.html',
  styleUrls: ['./smart-routing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmartRoutingComponent {
  public fromTradeProvider: Provider;

  public bridgeProvider: Provider;

  public toTradeProvider: Provider;

  @Input() set smartRouting(routing: SmartRouting) {
    this.bridgeProvider = this.tradesProviders[routing.bridgeProvider];
    this.fromTradeProvider = routing.fromProvider
      ? this.tradesProviders[routing.fromProvider]
      : {
          ...this.tradesProviders[routing.bridgeProvider],
          name: this.tradesProviders[routing.bridgeProvider].name + ' Pool'
        };
    this.toTradeProvider = routing.toProvider
      ? this.tradesProviders[routing.toProvider]
      : {
          ...this.tradesProviders[routing.bridgeProvider],
          name: this.tradesProviders[routing.bridgeProvider].name + ' Pool'
        };
  }

  public readonly tradesProviders = TRADES_PROVIDERS;

  public readonly isMobile$ = this.headerStoreService.getMobileDisplayStatus();

  constructor(private readonly headerStoreService: HeaderStore) {}
}

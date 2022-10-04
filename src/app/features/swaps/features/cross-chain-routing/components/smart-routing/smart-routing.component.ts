import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { Provider, TRADES_PROVIDERS } from '@shared/constants/common/trades-providers';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import { QueryParamsService } from '@core/services/query-params/query-params.service';

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
    console.log('=======================');
    console.log('Enabled Providers from query: ', this.queryParamsService.enabledProviders[0]);
    console.log('Bridge Provider before init: ', this.bridgeProvider);
    console.log('Bridge Provider app calculated: ', this.tradesProviders[routing.bridgeProvider]);

    this.bridgeProvider = this.queryParamsService.enabledProviders
      ? this.tradesProviders[this.queryParamsService.enabledProviders[0]]
      : this.tradesProviders[routing.bridgeProvider];

    console.log('Bridge Provider after init: ', this.bridgeProvider);
    console.log('=======================');

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

  constructor(
    private readonly headerStoreService: HeaderStore,
    private readonly queryParamsService: QueryParamsService
  ) {}
}

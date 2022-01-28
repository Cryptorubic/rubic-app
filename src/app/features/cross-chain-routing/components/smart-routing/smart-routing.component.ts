import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { tradesProviders } from '@shared/constants/common/trades-providers';

@Component({
  selector: 'app-smart-routing',
  templateUrl: './smart-routing.component.html',
  styleUrls: ['./smart-routing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmartRoutingComponent {
  @Input()
  fromProvider: INSTANT_TRADES_PROVIDERS;

  @Input()
  toProvider: INSTANT_TRADES_PROVIDERS;

  @Input()
  savings: number = 1.25;

  @Input()
  fromHasTrade: boolean;

  @Input()
  toHasTrade: boolean;

  public readonly tradesProviders = tradesProviders;

  constructor() {}
}

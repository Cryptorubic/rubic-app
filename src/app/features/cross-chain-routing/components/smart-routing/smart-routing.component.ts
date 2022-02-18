import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { HeaderStore } from '@app/core/header/services/header.store';
import BigNumber from 'bignumber.js';
import { TRADES_PROVIDERS } from '@shared/constants/common/trades-providers';

@Component({
  selector: 'app-smart-routing',
  templateUrl: './smart-routing.component.html',
  styleUrls: ['./smart-routing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmartRoutingComponent {
  @Input()
  public fromProvider: INSTANT_TRADES_PROVIDERS;

  @Input()
  public toProvider: INSTANT_TRADES_PROVIDERS;

  @Input()
  public savings: BigNumber;

  @Input()
  public fromHasTrade: boolean;

  @Input()
  public toHasTrade: boolean;

  public readonly tradesProviders = TRADES_PROVIDERS;

  public readonly isMobile$ = this.headerStoreService.getMobileDisplayStatus();

  constructor(private readonly headerStoreService: HeaderStore) {}
}

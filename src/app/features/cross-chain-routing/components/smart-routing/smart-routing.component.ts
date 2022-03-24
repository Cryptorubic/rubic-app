import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
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
  public fromProvider: INSTANT_TRADE_PROVIDER;

  @Input()
  public toProvider: INSTANT_TRADE_PROVIDER;

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

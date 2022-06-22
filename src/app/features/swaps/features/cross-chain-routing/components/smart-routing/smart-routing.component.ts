import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { TRADES_PROVIDERS } from '@shared/constants/common/trades-providers';
import { TradeType } from 'rubic-sdk';

@Component({
  selector: 'app-smart-routing',
  templateUrl: './smart-routing.component.html',
  styleUrls: ['./smart-routing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmartRoutingComponent {
  @Input()
  public fromProvider: TradeType;

  @Input()
  public toProvider: TradeType;

  @Input()
  public fromHasTrade: boolean;

  @Input()
  public toHasTrade: boolean;

  public readonly tradesProviders = TRADES_PROVIDERS;

  public readonly isMobile$ = this.headerStoreService.getMobileDisplayStatus();

  constructor(private readonly headerStoreService: HeaderStore) {}
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ChangenowResentTradesStoreService } from '@core/services/recent-trades/changenow-resent-trades-store.service';

@Component({
  selector: 'app-changenow-recent-trades-crypto',
  templateUrl: './changenow-recent-trades.component.html',
  styleUrls: ['./changenow-recent-trades.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangenowRecentTradesComponent {
  public readonly changenowRecentTrades =
    this.changenowResentTradesStoreService.changenowRecentTrades;

  constructor(
    private readonly changenowResentTradesStoreService: ChangenowResentTradesStoreService
  ) {}
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RecentTradesStoreService } from '@core/services/recent-trades/recent-trades-store.service';

@Component({
  selector: 'app-history-view',
  templateUrl: './history-view.component.html',
  styleUrls: ['./history-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryViewComponent {
  constructor(private readonly recentTradesStoreService: RecentTradesStoreService) {
    this.readAllTrades();
  }

  public readAllTrades(): void {
    setTimeout(() => this.recentTradesStoreService.updateUnreadTrades(true), 0);
  }
}

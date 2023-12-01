import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UnreadTradesService } from '@core/services/unread-trades-service/unread-trades.service';

@Component({
  selector: 'app-history-view',
  templateUrl: './history-view.component.html',
  styleUrls: ['./history-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryViewComponent {
  constructor(private readonly recentTradesStoreService: UnreadTradesService) {
    this.readAllTrades();
  }

  public readAllTrades(): void {
    this.recentTradesStoreService.updateUnreadTrades(true);
  }
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RecentTradesService } from '../../services/recent-trades.service';

@Component({
  selector: 'app-recent-crosschain-tx',
  templateUrl: './recent-crosschain-tx.component.html',
  styleUrls: ['./recent-crosschain-tx.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentCrosschainTxComponent implements OnInit {
  public readonly recentTrades = this.recentTradesService.recentTrades;

  constructor(private readonly recentTradesService: RecentTradesService) {}

  public ngOnInit(): void {
    this.recentTradesService.readAllTrades();
  }
}

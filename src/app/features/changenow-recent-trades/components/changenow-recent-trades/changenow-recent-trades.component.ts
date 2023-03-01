import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChangenowResentTradesStoreService } from '@core/services/recent-trades/changenow-resent-trades-store.service';
import { ChangenowPostTrade } from '@features/swaps/core/services/changenow-post-trade-service/models/changenow-post-trade';
import { ChangenowPostTradeService } from '@features/swaps/core/services/changenow-post-trade-service/changenow-post-trade.service';
import { ChangenowApiStatus } from 'rubic-sdk';

@Component({
  selector: 'app-changenow-recent-trades-crypto',
  templateUrl: './changenow-recent-trades.component.html',
  styleUrls: ['./changenow-recent-trades.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangenowRecentTradesComponent {
  public readonly allChangenowRecentTrades =
    this.changenowResentTradesStoreService.changenowRecentTrades;

  public changenowRecentTrades: ChangenowPostTrade[] = [];

  constructor(
    private readonly changenowResentTradesStoreService: ChangenowResentTradesStoreService,
    private readonly changenowPostTradeService: ChangenowPostTradeService
  ) {
    this.getChangenowRecentTrades();
  }

  private getChangenowRecentTrades(): void {
    this.changenowRecentTrades = this.allChangenowRecentTrades.filter(trade => {
      setTimeout(async () => {
        const status = await this.changenowPostTradeService.getChangenowSwapStatus(trade.id);
        return status !== ChangenowApiStatus.WAITING;
      }, 1000);
    });
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChangenowResentTradesStoreService } from '@core/services/recent-trades/changenow-resent-trades-store.service';
import { ChangenowPostTrade } from '@features/swaps/core/services/changenow-post-trade-service/models/changenow-post-trade';
import { ChangenowPostTradeService } from '@features/swaps/core/services/changenow-post-trade-service/changenow-post-trade.service';
import { BehaviorSubject, from, mergeMap } from 'rxjs';
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

  private readonly _changenowRecentTrades$ = new BehaviorSubject<ChangenowPostTrade[]>([]);

  public readonly changenowRecentTrades$ = this._changenowRecentTrades$.asObservable();

  constructor(
    private readonly changenowResentTradesStoreService: ChangenowResentTradesStoreService,
    private readonly changenowPostTradeService: ChangenowPostTradeService
  ) {
    this.getChangenowRecentTrades();
  }

  private getChangenowRecentTrades(): void {
    let confirmedTrades: ChangenowPostTrade[] = [];

    from(this.allChangenowRecentTrades)
      .pipe(
        mergeMap(async trade => {
          const status = await this.changenowPostTradeService.getChangenowSwapStatus(trade.id);

          if (status !== ChangenowApiStatus.WAITING) {
            return trade;
          }

          return null;
        })
      )
      .subscribe(trade => {
        if (trade !== null) {
          confirmedTrades.push(trade);
        }
        console.log(confirmedTrades);
        this._changenowRecentTrades$.next(confirmedTrades);
      });
  }
}

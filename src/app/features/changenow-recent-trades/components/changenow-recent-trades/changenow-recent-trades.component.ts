import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChangenowPostTrade } from '@features/swaps/core/services/changenow-post-trade-service/models/changenow-post-trade';
import { ChangenowPostTradeService } from '@features/swaps/core/services/changenow-post-trade-service/changenow-post-trade.service';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { CHANGENOW_API_STATUS } from 'rubic-sdk';
import { Router } from '@angular/router';
import { ChangenowRecentTradesStoreService } from '@core/services/recent-trades/changenow-recent-trades-store.service';

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
    private readonly changenowResentTradesStoreService: ChangenowRecentTradesStoreService,
    private readonly changenowPostTradeService: ChangenowPostTradeService,
    private readonly router: Router
  ) {
    this.getChangenowRecentTrades();
  }

  private getChangenowRecentTrades(): void {
    const tradeStatuses = this.allChangenowRecentTrades.map(trade => {
      return this.changenowPostTradeService.getChangenowSwapStatus(trade.id);
    });

    forkJoin(tradeStatuses)
      .pipe(
        map(statuses =>
          statuses
            .map((status, index) => ({
              trade: this.allChangenowRecentTrades[index],
              status
            }))
            .filter(tradeInfo => tradeInfo.status !== CHANGENOW_API_STATUS.WAITING)
            .map(tradeInfo => tradeInfo.trade)
        )
      )
      .subscribe(trades => {
        this._changenowRecentTrades$.next(trades);
      });
  }

  public navigateToCrossChainSwaps(): void {
    this.router.navigate(['/']);
  }
}

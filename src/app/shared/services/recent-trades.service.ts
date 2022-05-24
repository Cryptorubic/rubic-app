import { Injectable } from '@angular/core';
import { StoreService } from '@core/services/store/store.service';
import { BehaviorSubject } from 'rxjs';
import { RecentTrade } from '../models/my-trades/recent-trades.interface';

const MAX_LATEST_TRADES = 3;

@Injectable({
  providedIn: 'root'
})
export class RecentTradesService {
  get recentTradesFromLs(): RecentTrade[] {
    return this.storeService.fetchData().recentTrades;
  }

  private readonly _recentTrades$ = new BehaviorSubject(this.recentTradesFromLs);

  public readonly recentTrades$ = this._recentTrades$.asObservable();

  constructor(private readonly storeService: StoreService) {}

  public saveTrade(tradeData: RecentTrade): void {
    let currentRecentTrades = [...(this.recentTradesFromLs || [])];

    if (this?.recentTradesFromLs?.length === MAX_LATEST_TRADES) {
      currentRecentTrades.pop();
    }
    currentRecentTrades.unshift(tradeData);

    this.storeService.setItem('recentTrades', currentRecentTrades);
    this._recentTrades$.next(currentRecentTrades);
  }
}

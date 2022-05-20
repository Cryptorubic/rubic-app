import { Injectable } from '@angular/core';
import { LatestTrade } from '@app/shared/models/my-trades/latest-trades.interface';
import { StoreService } from '@core/services/store/store.service';

const MAX_LATEST_TRADES = 3;

@Injectable({
  providedIn: 'root'
})
export class MyTradesStoreService {
  get latestTrades(): LatestTrade[] {
    return this.storeService.fetchData().latestTrades;
  }

  constructor(private readonly storeService: StoreService) {}

  public saveTrade(tradeData: LatestTrade): void {
    let updatedLatestTrades = [...(this.latestTrades || [])];

    if (this?.latestTrades?.length === MAX_LATEST_TRADES) {
      updatedLatestTrades.pop();
    }

    updatedLatestTrades.unshift(tradeData);
    this.storeService.setItem('latestTrades', updatedLatestTrades);
  }
}

import { Injectable } from '@angular/core';
import { StoreService } from '../store/store.service';
import { ChangenowPostTrade } from '@features/swaps/core/services/changenow-post-trade-service/models/changenow-post-trade';

const MAX_LATEST_TRADES = 8;

@Injectable({
  providedIn: 'root'
})
export class ChangenowResentTradesStoreService {
  public get changenowRecentTrades(): ChangenowPostTrade[] {
    return this.storeService.getItem('changenowRecentTrades');
  }

  constructor(private readonly storeService: StoreService) {}

  public saveTrade(tradeData: ChangenowPostTrade): void {
    const currentUsersTrades = [...(this.changenowRecentTrades || [])];

    if (currentUsersTrades?.length === MAX_LATEST_TRADES) {
      currentUsersTrades.pop();
    }
    currentUsersTrades.unshift(tradeData);

    const updatedTrades = [...currentUsersTrades];

    this.storeService.setItem('changenowRecentTrades', updatedTrades);
  }
}

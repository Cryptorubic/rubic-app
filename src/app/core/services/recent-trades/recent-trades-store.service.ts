import { Injectable } from '@angular/core';
import { BlockchainName } from '@app/shared/models/blockchain/blockchain-name';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { BehaviorSubject, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { StoreService } from '../store/store.service';

const MAX_LATEST_TRADES = 3;

@Injectable({
  providedIn: 'root'
})
export class RecentTradesStoreService {
  private get recentTrades(): { [address: string]: RecentTrade[] } {
    return this.storeService.fetchData().recentTrades;
  }

  public get currentUserRecentTrades(): RecentTrade[] {
    return this.storeService.fetchData().recentTrades?.[this.userAddress] || [];
  }

  private get userAddress(): string {
    return this.authService.userAddress;
  }

  private get unreadTrades(): { [address: string]: number } {
    return this.storeService.fetchData().unreadTrades;
  }

  private readonly _unreadTrades$ = new BehaviorSubject<{ [address: string]: number }>(
    this.unreadTrades
  );

  public readonly unreadTrades$ = this._unreadTrades$
    .asObservable()
    .pipe(map(unreadTrades => unreadTrades?.[this.userAddress] || 0));

  constructor(
    private readonly storeService: StoreService,
    private readonly authService: AuthService
  ) {}

  public saveTrade(address: string, tradeData: RecentTrade): void {
    const currentUsersTrades = [...(this.recentTrades?.[address] || [])];

    if (currentUsersTrades?.length === MAX_LATEST_TRADES) {
      currentUsersTrades.pop();
    }
    currentUsersTrades.unshift(tradeData);

    const updatedTrades = { ...this.recentTrades, [address]: currentUsersTrades };

    this.storeService.setItem('recentTrades', updatedTrades);
    this.updateUnreadTrades();
  }

  public updateTrade(trade: RecentTrade): void {
    const updatedUserTrades = this.currentUserRecentTrades.map(localStorageTrade => {
      if (
        trade.srcTxHash === localStorageTrade.srcTxHash &&
        trade.fromBlockchain === localStorageTrade.fromBlockchain
      ) {
        return trade;
      } else {
        return localStorageTrade;
      }
    });

    this.storeService.setItem('recentTrades', {
      ...this.recentTrades,
      [this.userAddress]: updatedUserTrades
    });
  }

  public getSpecificTrade(srcTxHash: string, fromBlockchain: BlockchainName): RecentTrade {
    return this.currentUserRecentTrades.find(
      trade => trade.srcTxHash === srcTxHash && trade.fromBlockchain === fromBlockchain
    );
  }

  public updateUnreadTrades(readAll = false): void {
    const currentUsersUnreadTrades = this.unreadTrades?.[this.userAddress] || 0;

    if (readAll) {
      this.storeService.setItem('unreadTrades', { ...this.unreadTrades, [this.userAddress]: 0 });
      this._unreadTrades$.next({ ...this.unreadTrades, [this.userAddress]: 0 });
      return;
    }

    if (currentUsersUnreadTrades === 3) {
      return;
    }

    this.storeService.setItem('unreadTrades', {
      ...this.unreadTrades,
      [this.userAddress]: currentUsersUnreadTrades + 1
    });
    this._unreadTrades$.next({
      ...this.unreadTrades,
      [this.userAddress]: currentUsersUnreadTrades + 1
    });
  }
}

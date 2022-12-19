import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { StoreService } from '../store/store.service';
import { BlockchainName, CrossChainTradeType } from 'rubic-sdk';
import { RecentTrade } from '@shared/models/recent-trades/recent-trade';
import { isCrossChainRecentTrade } from '@shared/utils/recent-trades/is-cross-chain-recent-trade';
import { isOnramperRecentTrade } from '@shared/utils/recent-trades/is-onramper-recent-trade';
import { CrossChainRecentTrade } from '@shared/models/recent-trades/cross-chain-recent-trade';
import { OnramperRecentTrade } from '@shared/models/recent-trades/onramper-recent-trade';

const MAX_LATEST_TRADES = 5;

@Injectable({
  providedIn: 'root'
})
export class RecentTradesStoreService {
  private get recentTrades(): { [address: string]: RecentTrade[] } {
    return this.storeService.fetchData().recentTrades;
  }

  public get currentUserRecentTrades(): RecentTrade[] {
    return (
      this.storeService.fetchData().recentTrades?.[this.userAddress]?.map(recentTrade => {
        if ('crossChainProviderType' in recentTrade) {
          return {
            ...recentTrade,
            crossChainTradeType:
              recentTrade.crossChainProviderType.toLowerCase() as CrossChainTradeType // update deprecated field
          };
        }
        return recentTrade;
      }) || []
    );
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
      if (isCrossChainRecentTrade(trade)) {
        if (!isCrossChainRecentTrade(localStorageTrade)) {
          return localStorageTrade;
        }
        return trade.srcTxHash === localStorageTrade.srcTxHash ? trade : localStorageTrade;
      }

      if (isCrossChainRecentTrade(localStorageTrade)) {
        return localStorageTrade;
      }
      return trade.txId === localStorageTrade.txId ? trade : localStorageTrade;
    });

    this.storeService.setItem('recentTrades', {
      ...this.recentTrades,
      [this.userAddress]: updatedUserTrades
    });
  }

  public getSpecificCrossChainTrade(
    srcTxHash: string,
    fromBlockchain: BlockchainName
  ): CrossChainRecentTrade {
    return this.currentUserRecentTrades.find(
      trade =>
        isCrossChainRecentTrade(trade) &&
        trade.srcTxHash === srcTxHash &&
        trade.fromToken.blockchain === fromBlockchain
    ) as CrossChainRecentTrade;
  }

  public getSpecificOnramperTrade(txId: string): OnramperRecentTrade {
    return this.currentUserRecentTrades.find(
      trade => isOnramperRecentTrade(trade) && trade.txId === txId
    ) as OnramperRecentTrade;
  }

  public updateOnramperTargetTrade(txId: string, dstTxHash: string): void {
    const trade = this.getSpecificOnramperTrade(txId);
    this.updateTrade({
      ...trade,
      dstTxHash
    });
  }

  public updateUnreadTrades(readAll = false): void {
    const currentUsersUnreadTrades = this.unreadTrades?.[this.userAddress] || 0;

    if (readAll) {
      this.storeService.setItem('unreadTrades', { ...this.unreadTrades, [this.userAddress]: 0 });
      this._unreadTrades$.next({ ...this.unreadTrades, [this.userAddress]: 0 });
      return;
    }

    if (currentUsersUnreadTrades === MAX_LATEST_TRADES) {
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

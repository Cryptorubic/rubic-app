import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, map } from 'rxjs';
import { StoreService } from '@core/services/store/store.service';
import { WalletConnectorService } from '../wallets/wallet-connector-service/wallet-connector.service';

@Injectable({
  providedIn: 'root'
})
export class UnreadTradesService {
  private get unreadTrades(): { [address: string]: number } {
    const data = this.storeService.fetchData();
    return data?.['RUBIC_UNREAD_TRADES'];
  }

  private readonly _unreadTrades$ = new BehaviorSubject<{ [address: string]: number }>(
    this.unreadTrades
  );

  public readonly unreadTrades$ = this._unreadTrades$.asObservable().pipe(
    combineLatestWith(this.walletConnectorService.activeWallets$),
    map(([unreadTrades, activeWallets]) =>
      activeWallets.reduce((acc, wallet) => acc + unreadTrades?.[wallet.address], 0)
    )
  );

  constructor(
    private readonly storeService: StoreService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  public updateUnreadTrades(walletAddr: string, readAll = false): void {
    const currentUsersUnreadTrades = this.unreadTrades?.[walletAddr] || 0;

    if (readAll) {
      this.storeService.setItem('RUBIC_UNREAD_TRADES', {
        ...this.unreadTrades,
        [walletAddr]: 0
      });
      this._unreadTrades$.next({ ...this.unreadTrades, [walletAddr]: 0 });
      return;
    }

    this.storeService.setItem('RUBIC_UNREAD_TRADES', {
      ...this.unreadTrades,
      [walletAddr]: currentUsersUnreadTrades + 1
    });
    this._unreadTrades$.next({
      ...this.unreadTrades,
      [walletAddr]: currentUsersUnreadTrades + 1
    });
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MyTradesService } from 'src/app/features/my-trades/services/my-trades.service';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import { StoreService } from 'src/app/core/services/store/store.service';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CounterNotificationsService {
  private static storageKey = 'unreadTrades' as const;

  private _unreadReceived$ = new BehaviorSubject(0);

  private _unreadTrades$ = new BehaviorSubject(0);

  public get unread$(): Observable<number> {
    return combineLatest([this._unreadTrades$, this._unreadReceived$]).pipe(
      map(([unreadTrades, unreadReceived]) => unreadTrades + unreadReceived)
    );
  }

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly myTradesService: MyTradesService,
    private readonly storeService: StoreService
  ) {
    this.myTradesService.tableTrades$
      .pipe(
        filter(trades => !!trades),
        map(
          trades =>
            trades.filter(trade => trade.status === TRANSACTION_STATUS.WAITING_FOR_RECEIVING).length
        )
      )
      .subscribe(v => {
        this._unreadReceived$.next(v);
      });

    this.authService
      .getCurrentUser()
      .pipe(
        map(() => this.storeService.getItem(CounterNotificationsService.storageKey)),
        filter(unreadTrades => Number(unreadTrades) > 0)
      )
      .subscribe(this._unreadTrades$);
  }

  public updateUnread(count: number = 1): void {
    const unreadTrades = this._unreadTrades$.getValue();
    this.storeService.setItem(CounterNotificationsService.storageKey, unreadTrades + count);
    this._unreadTrades$.next(unreadTrades + count);
  }

  public resetCounter(): void {
    this.storeService.setItem(CounterNotificationsService.storageKey, 0);
    this._unreadTrades$.next(0);
  }
}

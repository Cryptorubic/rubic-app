import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MyTradesService } from 'src/app/features/my-trades/services/my-trades.service';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import { StoreService } from 'src/app/core/services/store/store.service';

@Injectable({
  providedIn: 'root'
})
export class CounterNotificationsService {
  private _unreadTrades: number = 0;

  private _unreadReceived: number = 0;

  private counterKey: 'unreadTrades' = 'unreadTrades';

  public unreadTradesSubject$: BehaviorSubject<number> = new BehaviorSubject(
    this._unreadTrades + this._unreadReceived
  );

  public get unreadTradesObservable(): Observable<number> {
    return this.unreadTradesSubject$.asObservable();
  }

  constructor(
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly myTradesService: MyTradesService,
    private readonly storeService: StoreService
  ) {
    this.myTradesService.tableTrades$.subscribe(trades => {
      if (trades) {
        this._unreadReceived = trades.filter(
          trade => trade.status === TRANSACTION_STATUS.WAITING_FOR_RECEIVING
        ).length;
        this.unreadTradesSubject$.next(this._unreadTrades + this._unreadReceived);
      }
    });
    this.authService.getCurrentUser().subscribe(() => {
      const unreadTrades = this.storeService.getItem(this.counterKey);
      if (+unreadTrades > 0) {
        this._unreadTrades = unreadTrades;
        this.unreadTradesSubject$.next(this._unreadTrades + this._unreadReceived);
      }
    });
  }

  public updateUnread(count: number = 1) {
    this._unreadTrades += count;
    this.storeService.setItem(this.counterKey, this._unreadTrades);
    this.unreadTradesSubject$.next(this._unreadTrades + this._unreadReceived);
  }

  public resetCounter() {
    this._unreadTrades = 0;
    this.storeService.setItem(this.counterKey, 0);
    this.unreadTradesSubject$.next(this._unreadReceived);
  }
}

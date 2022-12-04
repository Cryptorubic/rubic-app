import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { webSocket } from 'rxjs/webSocket';
import { switchMap } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { OnramperTransactionInfo } from '@features/onramper-exchange/services/exchanger-websocket-service/models/onramper-transaction-info';

@Injectable({
  providedIn: 'root'
})
export class ExchangerWebsocketService {
  private readonly _info$ = new BehaviorSubject<OnramperTransactionInfo>(null);

  public readonly info$ = this._info$.asObservable();

  constructor(private readonly authService: AuthService) {
    this.authService.currentUser$
      .pipe(
        switchMap(user => {
          if (!user?.address) {
            return of(null);
          }
          return webSocket<{ message: string }>(
            `wss://dev-api.rubic.exchange/ws/onramp/transactions_receiver/${user.address}`
          );
        })
      )
      .subscribe(event => {
        if (event && 'message' in event) {
          const transactionInfo: OnramperTransactionInfo = JSON.parse(event.message);
          if (transactionInfo?.status) {
            this._info$.next(transactionInfo);
          }
        }
      });
  }
}

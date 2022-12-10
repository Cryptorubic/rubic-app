import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { webSocket } from 'rxjs/webSocket';
import { switchMap } from 'rxjs/operators';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { OnramperTransactionInfo } from '@features/swaps/features/onramper-exchange/services/onramper-websocket-service/models/onramper-transaction-info';
import { OnramperTransactionStatus } from '@features/swaps/features/onramper-exchange/services/onramper-websocket-service/models/onramper-transaction-status';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ProgressTrxNotificationComponent } from '@shared/components/progress-trx-notification/progress-trx-notification.component';
import { TuiNotification } from '@taiga-ui/core';
import { SuccessTrxNotificationComponent } from '@shared/components/success-trx-notification/success-trx-notification.component';
import { EvmWeb3Pure } from 'rubic-sdk';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { OnramperService } from '@core/services/onramper/onramper.service';

@Injectable()
export class OnramperWebsocketService {
  private readonly _info$ = new BehaviorSubject<OnramperTransactionInfo>(null);

  public readonly info$ = this._info$.asObservable();

  constructor(
    private readonly authService: AuthService,
    private readonly notificationsService: NotificationsService,
    private readonly swapFormService: SwapFormService,
    private readonly onramperService: OnramperService
  ) {
    this.subscribeOnUserChange();

    this.subscribeOnTransactionInfo();
  }

  private subscribeOnUserChange(): void {
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

  private subscribeOnTransactionInfo(): void {
    let subscription$: Subscription;
    this.info$.subscribe(info => {
      if (info?.status === OnramperTransactionStatus.PENDING) {
        subscription$ = this.notificationsService.show(
          new PolymorpheusComponent(ProgressTrxNotificationComponent),
          {
            status: TuiNotification.Info,
            autoClose: false
          }
        );
      }

      if (info?.status === OnramperTransactionStatus.COMPLETED) {
        subscription$?.unsubscribe();
        this.notificationsService.show(new PolymorpheusComponent(SuccessTrxNotificationComponent), {
          status: TuiNotification.Success,
          autoClose: 15000,
          data: { type: 'instant-trade' }
        });

        const toToken = this.swapFormService.inputValue.toToken;
        if (!EvmWeb3Pure.isNativeAddress(toToken.address)) {
          this.onramperService.updateSwapFormByRecentTrade(info.transaction_id);
        }
      }
    });
  }
}

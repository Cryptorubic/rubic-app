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
import BigNumber from 'bignumber.js';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';

@Injectable({
  providedIn: 'root'
})
export class OnramperWebsocketService {
  private readonly _info$ = new BehaviorSubject<OnramperTransactionInfo>(null);

  public readonly info$ = this._info$.asObservable();

  constructor(
    private readonly authService: AuthService,
    private readonly notificationsService: NotificationsService,
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService,
    private readonly queryParamsService: QueryParamsService
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
          const blockchain = toToken.blockchain;
          const nativeToken = this.tokensService.tokens.find(
            token => token.blockchain === blockchain && EvmWeb3Pure.isNativeAddress(token.address)
          );
          this.swapFormService.inputControl.patchValue({
            fromAssetType: blockchain,
            fromAsset: nativeToken,
            toBlockchain: blockchain,
            toToken,
            fromAmount: new BigNumber(info.out_amount).minus(0.01)
          });
          this.queryParamsService.patchQueryParams({ afterOnramper: true });
        }
      }
    });
  }
}

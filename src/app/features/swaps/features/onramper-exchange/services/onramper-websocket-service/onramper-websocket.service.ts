import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { webSocket } from 'rxjs/webSocket';
import { switchMap } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { OnramperTransactionInfo } from '@features/swaps/features/onramper-exchange/services/onramper-websocket-service/models/onramper-transaction-info';
import { OnramperTransactionStatus } from '@features/swaps/features/onramper-exchange/services/onramper-websocket-service/models/onramper-transaction-status';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ProgressTrxNotificationComponent } from '@shared/components/progress-trx-notification/progress-trx-notification.component';
import { TuiNotification } from '@taiga-ui/core';
import { SuccessTrxNotificationComponent } from '@shared/components/success-trx-notification/success-trx-notification.component';
import { EvmWeb3Pure, TxStatus } from 'rubic-sdk';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { OnramperService } from '@core/services/onramper/onramper.service';
import { OnramperFormService } from '@features/swaps/features/onramper-exchange/services/onramper-form-service/onramper-form.service';
import { RecentTradesStoreService } from '@core/services/recent-trades/recent-trades-store.service';
import { OnramperRecentTrade } from '@shared/models/recent-trades/onramper-recent-trade';
import { SwapFormInputFiats } from '@core/services/swaps/models/swap-form-fiats';

@Injectable()
export class OnramperWebsocketService {
  private progressNotificationSubscription$: Subscription;

  /**
   * If true, then form will be relocated to on-chain, after
   * native is bought through onramper.
   */
  private relocateToOnChain = false;

  /**
   * Stores form, which was used for onramper swap.
   */
  private inputForm: SwapFormInputFiats;

  constructor(
    private readonly authService: AuthService,
    private readonly notificationsService: NotificationsService,
    private readonly swapFormService: SwapFormService,
    private readonly onramperFormService: OnramperFormService,
    private readonly onramperService: OnramperService,
    private readonly recentTradesStoreService: RecentTradesStoreService
  ) {
    this.subscribeOnUserChange();
    this.subscribeOnForm();
    this.subscribeOnWidgetOpened();
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
          const txInfo: OnramperTransactionInfo = JSON.parse(event.message);
          if (txInfo?.status) {
            this.parseTransactionInfo(txInfo);
          }
        }
      });
  }

  private parseTransactionInfo(txInfo: OnramperTransactionInfo): void {
    if (txInfo?.status === OnramperTransactionStatus.PENDING) {
      this.progressNotificationSubscription$ = this.notificationsService.show(
        new PolymorpheusComponent(ProgressTrxNotificationComponent),
        {
          status: TuiNotification.Info,
          autoClose: false,
          data: { withRecentTrades: true }
        }
      );

      this.onramperFormService.widgetOpened = false;

      const recentTrade: OnramperRecentTrade = {
        fromFiat: this.inputForm.fromFiat,
        toToken: this.inputForm.toToken,

        txId: txInfo.transaction_id,

        timestamp: Date.now(),
        calculatedStatusTo: TxStatus.PENDING
      };
      this.recentTradesStoreService.saveTrade(txInfo.additional_info.wallet_address, recentTrade);
    } else if (txInfo?.status === OnramperTransactionStatus.COMPLETED) {
      this.progressNotificationSubscription$?.unsubscribe();
      this.notificationsService.show(new PolymorpheusComponent(SuccessTrxNotificationComponent), {
        status: TuiNotification.Success,
        autoClose: 15000,
        data: { type: 'on-chain', withRecentTrades: true }
      });

      if (this.relocateToOnChain) {
        if (!EvmWeb3Pure.isNativeAddress(this.inputForm.toToken.address)) {
          this.onramperService.updateSwapFormByRecentTrade(txInfo.transaction_id);
        }
      }
    }
  }

  private subscribeOnForm(): void {
    this.swapFormService.inputValueDistinct$.subscribe(() => {
      this.relocateToOnChain = false;
    });
  }

  private subscribeOnWidgetOpened(): void {
    this.onramperFormService.widgetOpened$.subscribe(opened => {
      if (opened) {
        this.relocateToOnChain = true;
        this.inputForm = this.swapFormService.inputValue as SwapFormInputFiats;
      }
    });
  }
}

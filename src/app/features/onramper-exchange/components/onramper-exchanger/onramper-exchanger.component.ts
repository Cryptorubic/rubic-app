import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { ErrorsService } from '@core/errors/errors.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { ExchangerWebsocketService } from '@features/onramper-exchange/services/exchanger-websocket-service/exchanger-websocket.service';
import { OnramperTransactionStatus } from '@features/onramper-exchange/services/exchanger-websocket-service/models/onramper-transaction-status';
import { Router } from '@angular/router';
import { CROSS_CHAIN_TRADE_TYPE, EvmWeb3Pure, nativeTokensList } from 'rubic-sdk';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import BigNumber from 'bignumber.js';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ProgressTrxNotificationComponent } from '@shared/components/progress-trx-notification/progress-trx-notification.component';
import { TuiNotification } from '@taiga-ui/core';
import { SuccessTrxNotificationComponent } from '@shared/components/success-trx-notification/success-trx-notification.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-onramper-exchanger',
  templateUrl: './onramper-exchanger.component.html',
  styleUrls: ['./onramper-exchanger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperExchangerComponent {
  public isWidgetOpened = false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly errorsService: ErrorsService,
    private readonly exchangerFormService: ExchangerFormService,
    private readonly exchangerWebsocketService: ExchangerWebsocketService,
    private readonly router: Router,
    private readonly swapFormService: SwapFormService,
    private readonly notificationsService: NotificationsService
  ) {
    let subscription$: Subscription;
    this.exchangerWebsocketService.info$.subscribe(info => {
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
          data: {
            type: 'instant-trade',
            ccrProviderType: CROSS_CHAIN_TRADE_TYPE.CELER
          }
        });

        const toToken = this.exchangerFormService.toToken;
        if (EvmWeb3Pure.isNativeAddress(toToken.address)) {
          this.isWidgetOpened = false;
          this.cdr.detectChanges();
        } else {
          const blockchain = toToken.blockchain;
          this.swapFormService.input.patchValue({
            fromBlockchain: blockchain,
            toBlockchain: blockchain,
            fromToken: {
              ...nativeTokensList[blockchain],
              amount: new BigNumber(NaN)
            },
            toToken,
            fromAmount: new BigNumber(info.out_amount).minus(0.01)
          });

          this.router.navigate(['/']);
        }
      }
    });
  }

  public onSwapClick(): void {
    if (!this.authService.userAddress) {
      this.errorsService.catch(new RubicError('Connect wallet!'));
    } else {
      this.isWidgetOpened = true;
    }
  }
}

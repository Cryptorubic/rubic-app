import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { ErrorsService } from '@core/errors/errors.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { Router } from '@angular/router';
import { EvmWeb3Pure } from 'rubic-sdk';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ProgressTrxNotificationComponent } from '@shared/components/progress-trx-notification/progress-trx-notification.component';
import { TuiNotification } from '@taiga-ui/core';
import { SuccessTrxNotificationComponent } from '@shared/components/success-trx-notification/success-trx-notification.component';
import { Subscription } from 'rxjs';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { ExchangerWebsocketService } from '@features/swaps/features/onramper-exchange/services/exchanger-websocket-service/exchanger-websocket.service';
import { OnramperTransactionStatus } from '@features/swaps/features/onramper-exchange/services/exchanger-websocket-service/models/onramper-transaction-status';
import BigNumber from 'bignumber.js';
import { OnramperBottomFormService } from '@features/swaps/features/onramper-exchange/services/onramper-bottom-form-service/onramper-bottom-form-service';

@Component({
  selector: 'app-onramper-bottom-form',
  templateUrl: './onramper-bottom-form.component.html',
  styleUrls: ['./onramper-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperBottomFormComponent {
  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly errorsService: ErrorsService,
    private readonly exchangerWebsocketService: ExchangerWebsocketService,
    private readonly router: Router,
    private readonly swapFormService: SwapFormService,
    private readonly notificationsService: NotificationsService,
    private readonly tokensService: TokensService,
    private readonly onramperBottomFormService: OnramperBottomFormService
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
          data: { type: 'instant-trade' }
        });

        const toToken = this.swapFormService.inputValue.toToken;
        if (EvmWeb3Pure.isNativeAddress(toToken.address)) {
          this.onramperBottomFormService.widgetOpened = false;
          this.cdr.detectChanges();
        } else {
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

          this.router.navigate(['/']);
        }
      }
    });
  }

  public onSwapClick(): void {
    if (!this.authService.userAddress) {
      this.errorsService.catch(new RubicError('Connect wallet!'));
    } else {
      this.onramperBottomFormService.widgetOpened = true;
    }
  }
}

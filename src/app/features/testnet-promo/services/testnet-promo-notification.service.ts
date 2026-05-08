import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import {
  UserRejectError,
  InsufficientFundsGasPriceValueError as SdkInsufficientFundsGasPriceValueError
} from '@cryptorubic/web3';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TestnetPromoNotificationService {
  private wrongWalletTypeSubscription: Subscription | null = null;

  constructor(
    private readonly translateService: TranslateService,
    private readonly notificationsService: NotificationsService
  ) {}

  public showWrongWalletNotification(): void {
    if (!this.wrongWalletTypeSubscription) {
      this.wrongWalletTypeSubscription = this.notificationsService.show(
        'Wrong wallet. You should connect EVM wallet to participate in the Promo.',
        {
          appearance: 'negative',
          autoClose: 10000,
          data: null,
          icon: '',
        }
      );
    }
  }

  public showProgressNotification(): Subscription {
    return this.notificationsService.show(
      this.translateService.instant(`testnetPromo.notification.progress`),
      {
        appearance: 'info',
        autoClose: 0,
        data: null,
        icon: '',
      }
    );
  }

  public showSuccessNotification(): Subscription {
    return this.notificationsService.show(
      this.translateService.instant(`testnetPromo.notification.success`),
      {
        appearance: 'positive',
        autoClose: 10000,
        data: null,
        icon: '',
      }
    );
  }

  public showErrorNotification(err: unknown): void {
    if (err instanceof Error) {
      let label: string;
      let appearance: string;

      if (err.message === 'paused') {
        label = this.translateService.instant('testnetPromo.notification.paused');
        appearance = 'warning';
      } else if (err.message === 'claimed') {
        label = this.translateService.instant('testnetPromo.notification.claimed');
        appearance = 'warning';
      } else if (err.message.includes('User denied transaction signature')) {
        label = this.translateService.instant('testnetPromo.notification.reject');
        appearance = 'negative';
      } else if (err.message === 'wrong chain') {
        label =
          'Please make sure to select the Arbitrum network in your wallet. Other networks are not supported.';
        appearance = 'negative';
      } else {
        label = this.translateService.instant('testnetPromo.notification.unknown');
        appearance = 'negative';
      }

      if (err instanceof UserRejectError) {
        label = this.translateService.instant('testnetPromo.notification.reject');
        appearance = 'negative';
      }

      if (err instanceof SdkInsufficientFundsGasPriceValueError) {
        label = this.translateService.instant('testnetPromo.notification.notEnoughBalance');
        appearance = 'negative';
      }

      this.notificationsService.show(label, {
        autoClose: 10000,
        appearance,
        data: null,
        icon: '',
      });
    }
  }
}

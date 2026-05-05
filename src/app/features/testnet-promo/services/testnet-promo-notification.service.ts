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
          status: 'error',
          autoClose: 10000,
          data: null,
          icon: '',
          defaultAutoCloseTime: 0
        }
      );
    }
  }

  public showProgressNotification(): Subscription {
    return this.notificationsService.show(
      this.translateService.instant(`testnetPromo.notification.progress`),
      {
        status: 'info',
        autoClose: false,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      }
    );
  }

  public showSuccessNotification(): Subscription {
    return this.notificationsService.show(
      this.translateService.instant(`testnetPromo.notification.success`),
      {
        status: 'success',
        autoClose: 10000,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      }
    );
  }

  public showErrorNotification(err: unknown): void {
    if (err instanceof Error) {
      let label: string;
      let status;

      if (err.message === 'paused') {
        label = this.translateService.instant('testnetPromo.notification.paused');
        status = 'warning';
      } else if (err.message === 'claimed') {
        label = this.translateService.instant('testnetPromo.notification.claimed');
        status = 'warning';
      } else if (err.message.includes('User denied transaction signature')) {
        label = this.translateService.instant('testnetPromo.notification.reject');
        status = 'error';
      } else if (err.message === 'wrong chain') {
        label =
          'Please make sure to select the Arbitrum network in your wallet. Other networks are not supported.';
        status = 'error';
      } else {
        label = this.translateService.instant('testnetPromo.notification.unknown');
        status = 'error';
      }

      if (err instanceof UserRejectError) {
        label = this.translateService.instant('testnetPromo.notification.reject');
        status = 'error';
      }

      if (err instanceof SdkInsufficientFundsGasPriceValueError) {
        label = this.translateService.instant('testnetPromo.notification.notEnoughBalance');
        status = 'error';
      }

      this.notificationsService.show(label, {
        autoClose: 10000,
        status,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      });
    }
  }
}

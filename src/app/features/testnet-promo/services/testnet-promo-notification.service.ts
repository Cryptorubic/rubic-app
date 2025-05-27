import { TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { UserRejectError } from 'rubic-sdk';
import { InsufficientFundsGasPriceValueError as SdkInsufficientFundsGasPriceValueError } from 'rubic-sdk/lib/common/errors/cross-chain/insufficient-funds-gas-price-value.error';
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
          status: TuiNotification.Error,
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
        status: TuiNotification.Info,
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
        status: TuiNotification.Success,
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
      let status: TuiNotification;

      if (err.message === 'paused') {
        label = this.translateService.instant('testnetPromo.notification.paused');
        status = TuiNotification.Warning;
      } else if (err.message === 'claimed') {
        label = this.translateService.instant('testnetPromo.notification.claimed');
        status = TuiNotification.Warning;
      } else if (err.message.includes('User denied transaction signature')) {
        label = this.translateService.instant('testnetPromo.notification.reject');
        status = TuiNotification.Error;
      } else {
        label = this.translateService.instant('testnetPromo.notification.unknown');
        status = TuiNotification.Error;
      }

      if (err instanceof UserRejectError) {
        label = this.translateService.instant('testnetPromo.notification.reject');
        status = TuiNotification.Error;
      }

      if (err instanceof SdkInsufficientFundsGasPriceValueError) {
        label = this.translateService.instant('testnetPromo.notification.notEnoughBalance');
        status = TuiNotification.Error;
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

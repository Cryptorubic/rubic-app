import { TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class BerachellaNotificationService {
  private wrongWalletTypeSubscription: Subscription | null = null;

  constructor(
    private readonly translateService: TranslateService,
    private readonly notificationsService: NotificationsService
  ) {}

  public showWrongWalletNotification(): void {
    if (!this.wrongWalletTypeSubscription) {
      this.wrongWalletTypeSubscription = this.notificationsService.show(
        'Wrong wallet. You should connect EVM wallet to successfully sign the signature.',
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
    return this.notificationsService.show('Submit in progress', {
      status: TuiNotification.Info,
      autoClose: false,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
  }

  public showSuccessNotification(): Subscription {
    return this.notificationsService.show('Tickets successfully sent', {
      status: TuiNotification.Success,
      autoClose: 10000,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
  }

  public showErrorNotification(err: unknown): void {
    if (err instanceof Error) {
      let label = 'An error occurred while processing your tickets. Please try again.';
      let status: TuiNotification = TuiNotification.Error;

      if (err.message.includes('User rejected the request')) {
        label =
          'You rejected the request. Please confirm message signature in order to complete tickets sending.';
      } else if (err instanceof Error && err.message.includes('Invalid signature')) {
        label = 'Invalid signature. Please sign the message again.';
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

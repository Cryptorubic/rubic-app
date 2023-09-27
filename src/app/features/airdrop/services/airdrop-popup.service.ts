import { Injectable } from '@angular/core';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { UserRejectError } from 'rubic-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SuccessClaimModalComponent } from '@features/airdrop/components/success-claim-modal/success-claim-modal.component';
import { DifferentAddressesModalComponent } from '@features/airdrop/components/different-addresses-modal/different-addresses-modal.component';

@Injectable({ providedIn: 'root' })
export class AirdropPopupService {
  constructor(
    private readonly translateService: TranslateService,
    private readonly notificationsService: NotificationsService,
    private readonly dialogService: TuiDialogService
  ) {}

  public showProgressNotification(): Subscription {
    return this.notificationsService.show(
      this.translateService.instant('airdrop.notification.progress'),
      {
        status: TuiNotification.Info,
        autoClose: false,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      }
    );
  }

  public showUnauthorizedUserNotification(): Subscription {
    return this.notificationsService.show(
      this.translateService.instant('airdrop.notification.unauthorized'),
      {
        status: TuiNotification.Warning,
        autoClose: 10000,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      }
    );
  }

  public showSuccessNotification(): Subscription {
    return this.notificationsService.show(
      this.translateService.instant('airdrop.notification.success'),
      {
        status: TuiNotification.Success,
        autoClose: 10000,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      }
    );
  }

  public showSuccessModal(hash: string): Subscription {
    return this.dialogService
      .open(new PolymorpheusComponent(SuccessClaimModalComponent), {
        size: 'm',
        data: { hash }
      })
      .subscribe();
  }

  public showWarningModal(): Observable<boolean> {
    return this.dialogService.open<boolean>(
      new PolymorpheusComponent(DifferentAddressesModalComponent),
      { size: 'm' }
    );
  }

  public handleError(err: unknown): void {
    if (err instanceof Error) {
      let label: string;
      let status: TuiNotification;
      if (err.message === 'paused') {
        label = this.translateService.instant('airdrop.notification.paused');
        status = TuiNotification.Warning;
      } else if (err.message === 'claimed') {
        label = this.translateService.instant('airdrop.notification.claimed');
        status = TuiNotification.Warning;
      } else if (err.message === 'User does not agree to claim tokens') {
        label = this.translateService.instant('airdrop.notification.reject');
        status = TuiNotification.Error;
      } else {
        label = this.translateService.instant('airdrop.notification.unknown');
        status = TuiNotification.Error;
      }

      if (err instanceof UserRejectError) {
        label = this.translateService.instant('airdrop.notification.reject');
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

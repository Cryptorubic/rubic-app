import { Injectable } from '@angular/core';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { TuiNotification } from '@taiga-ui/core';
import { Subscription } from 'rxjs';

@Injectable()
export class LpProvidingNotificationsService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly translate: TranslateService
  ) {}

  public showApproveInProgressNotification(): Subscription {
    return this.notificationsService.show(
      this.translate.instant('notifications.approveInProgress'),
      {
        status: TuiNotification.Info
      }
    );
  }

  public showSuccessApproveNotification(): void {
    this.notificationsService.show(this.translate.instant('notifications.successfulStake'), {
      status: TuiNotification.Success,
      autoClose: 5000
    });
  }

  public showDepositInProgressNotification(): Subscription {
    return this.notificationsService.show(this.translate.instant('notifications.successfulStake'), {
      status: TuiNotification.Info,
      autoClose: 5000
    });
  }

  public showSuccessDepositNotification(): void {
    this.notificationsService.show(this.translate.instant('notifications.successfulStake'), {
      status: TuiNotification.Success,
      autoClose: 5000
    });
  }

  public showRequestWithdrawNotification(): void {}
}

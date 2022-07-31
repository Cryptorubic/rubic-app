import { Injectable } from '@angular/core';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { TuiNotification } from '@taiga-ui/core';

@Injectable()
export class StakingNotificationService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly translate: TranslateService
  ) {}

  public showSuccessDepositNotification(): void {
    this.notificationsService.show(this.translate.instant('notifications.successfulStake'), {
      status: TuiNotification.Success,
      autoClose: 3000
    });
  }

  public showSuccessApproveNotification(): void {
    this.notificationsService.show('Successful RBC approve', {
      status: TuiNotification.Success,
      autoClose: 3000
    });
  }

  public showNftLockedError(lockedUntil: string): void {
    this.notificationsService.show(`Nft is locked until ${lockedUntil}`, {
      autoClose: 1500,
      status: TuiNotification.Error
    });
  }
}

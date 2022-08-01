import { Injectable } from '@angular/core';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TuiNotification } from '@taiga-ui/core';

@Injectable()
export class StakingNotificationService {
  constructor(private readonly notificationsService: NotificationsService) {}

  public showSuccessDepositNotification(): void {
    this.notificationsService.show('BRBC have been deposited', {
      status: TuiNotification.Success,
      autoClose: 3000
    });
  }

  public showSuccessClaimNotification(): void {
    this.notificationsService.show('Rewards have been claimed', {
      status: TuiNotification.Success,
      autoClose: 3000
    });
  }

  public showSuccessWithdrawNotification(): void {
    this.notificationsService.show('Withdrawal has been succesful', {
      status: TuiNotification.Success,
      autoClose: 3000
    });
  }

  public showSuccessApproveNotification(): void {
    this.notificationsService.show('Successful BRBC approve', {
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

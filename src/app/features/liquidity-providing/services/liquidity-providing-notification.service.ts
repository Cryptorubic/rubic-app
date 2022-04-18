import { Injectable } from '@angular/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { UnknownError } from '@app/core/errors/models/unknown.error';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { TuiNotification } from '@taiga-ui/core';

@Injectable()
export class LiquidityProvidingNotificationService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly errorService: ErrorsService,
    private readonly translate: TranslateService
  ) {}

  public showSuccessApproveNotification(): void {
    this.notificationsService.show(this.translate.instant('notifications.successApprove'), {
      status: TuiNotification.Success,
      autoClose: 5000
    });
  }

  public showSuccessDepositNotification(): void {
    this.notificationsService.show(this.translate.instant('notifications.successfulStake'), {
      status: TuiNotification.Success,
      autoClose: 5000
    });
  }

  public showSuccessRewardsClaimNotification(): void {
    this.notificationsService.show(this.translate.instant('notifications.successClaimRewards'), {
      status: TuiNotification.Success,
      autoClose: 5000
    });
  }

  public showSuccessWithdrawRequestNotification(): void {
    this.notificationsService.show('Deposit withdraw requested successful', {
      status: TuiNotification.Success,
      autoClose: 5000
    });
  }

  public showSuccessWithdrawNotification(): void {
    this.notificationsService.show(this.translate.instant('notifications.successfulWithdraw'), {
      status: TuiNotification.Success,
      autoClose: 5000
    });
  }

  public showErrorNotification(txHash: string): void {
    this.errorService.catch(new UnknownError(`Transaction hash ${txHash}`));
  }

  public showSuccessTransferNotification(): void {
    this.notificationsService.show('Successful transfer', {
      status: TuiNotification.Success,
      autoClose: 5000
    });
  }
}

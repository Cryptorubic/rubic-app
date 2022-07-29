// import { Injectable } from '@angular/core';
// import { ErrorsService } from '@app/core/errors/errors.service';
// import { UnknownError } from '@app/core/errors/models/unknown.error';
// import { NotificationsService } from '@app/core/services/notifications/notifications.service';
// import { TranslateService } from '@ngx-translate/core';
// import { TuiNotification } from '@taiga-ui/core';
// import { PoolToken } from '../models/pool-token.enum';

// const SUCCESS_NOTIFICATION_OPTIONS = {
//   status: TuiNotification.Success,
//   autoClose: 3000
// };

// @Injectable()
// export class LiquidityProvidingNotificationService {
//   constructor(
//     private readonly notificationsService: NotificationsService,
//     private readonly errorService: ErrorsService,
//     private readonly translate: TranslateService
//   ) {}

//   public showSuccessApproveNotification(token: PoolToken): void {
//     this.notificationsService.show(`Successful ${token} approve`, SUCCESS_NOTIFICATION_OPTIONS);
//   }

//   public showSuccessDepositNotification(): void {
//     this.notificationsService.show(
//       this.translate.instant('notifications.successfulStake'),
//       SUCCESS_NOTIFICATION_OPTIONS
//     );
//   }

//   public showSuccessRewardsClaimNotification(): void {
//     this.notificationsService.show('Rewards collected successful', SUCCESS_NOTIFICATION_OPTIONS);
//   }

//   public showSuccessWithdrawRequestNotification(): void {
//     this.notificationsService.show('Withdrawal request successful', SUCCESS_NOTIFICATION_OPTIONS);
//   }

//   public showSuccessWithdrawNotification(): void {
//     this.notificationsService.show(
//       this.translate.instant('notifications.successfulWithdraw'),
//       SUCCESS_NOTIFICATION_OPTIONS
//     );
//   }

//   public showSuccessTransferNotification(): void {
//     this.notificationsService.show('Successful transfer', SUCCESS_NOTIFICATION_OPTIONS);
//   }

//   public showErrorNotification(txHash: string): void {
//     this.errorService.catch(new UnknownError(`Transaction hash ${txHash}`));
//   }
// }

import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ProgressTrxNotificationComponent } from '@shared/components/progress-trx-notification/progress-trx-notification.component';
import { TuiNotification } from '@taiga-ui/core';
import { inject, Injectable } from '@angular/core';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { Observable, Subscription } from 'rxjs';
import { SuccessTrxNotificationComponent } from '@shared/components/success-trx-notification/success-trx-notification.component';
import { SuccessTxModalType } from '@shared/components/success-trx-notification/models/modal-type';
import { SuccessTxModalService } from '@features/swaps/core/services/success-tx-modal-service/success-tx-modal.service';

@Injectable()
export abstract class TradeService {
  protected showSuccessTrxNotification = (): void => {
    this.notificationsService.show(new PolymorpheusComponent(SuccessTrxNotificationComponent), {
      status: TuiNotification.Success,
      autoClose: 15000,
      data: {
        type: this.successTxModalType
      }
    });
  };

  private showTrxInProgressTrxNotification = (): Observable<void> => {
    return this.notificationsService.showWithoutSubscribe(
      new PolymorpheusComponent(ProgressTrxNotificationComponent),
      {
        status: TuiNotification.Info,
        autoClose: 150000
      }
    );
  };

  // injected services start
  protected readonly notificationsService = inject(NotificationsService);

  private readonly successTxModalService = inject(SuccessTxModalService);
  // injected services end

  protected constructor(private readonly successTxModalType: SuccessTxModalType) {}

  protected notifyTradeInProgress(
    transactionHash: string,
    blockchain: BlockchainName
  ): Subscription {
    return this.successTxModalService.open(
      transactionHash,
      blockchain,
      this.successTxModalType,
      this.showTrxInProgressTrxNotification
    );
  }
}

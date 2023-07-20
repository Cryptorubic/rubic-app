import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ProgressTrxNotificationComponent } from '@shared/components/progress-trx-notification/progress-trx-notification.component';
import { TuiNotification } from '@taiga-ui/core';
import { inject, Injectable } from '@angular/core';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { SuccessTxModalService } from '@core/services/success-tx-modal-service/success-tx-modal.service';
import { Observable, Subscription } from 'rxjs';
import { SuccessTrxNotificationComponent } from '@shared/components/success-trx-notification/success-trx-notification.component';
import { SuccessTxModalType } from '@shared/components/success-trx-notification/models/modal-type';
import { BlockchainName, CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from 'rubic-sdk';

@Injectable()
export abstract class TradeCalculationService {
  protected showSuccessTrxNotification = (): void => {
    this.notificationsService.show(new PolymorpheusComponent(SuccessTrxNotificationComponent), {
      status: TuiNotification.Success,
      autoClose: 10000,
      data: {
        type: this.successTxModalType,
        withRecentTrades: this.successTxModalType !== 'on-chain'
      }
    });
  };

  private showTrxInProgressTrxNotification = (): Observable<void> => {
    return this.notificationsService.showWithoutSubscribe(
      new PolymorpheusComponent(ProgressTrxNotificationComponent),
      {
        status: TuiNotification.Info,
        autoClose: false,
        data: null
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
    blockchain: BlockchainName,
    isSwapAndEarnSwap: boolean,
    ccrProviderType: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE
  ): Subscription {
    return this.successTxModalService.open(
      transactionHash,
      blockchain,
      this.successTxModalType,
      ccrProviderType,
      this.showTrxInProgressTrxNotification,
      isSwapAndEarnSwap
    );
  }
}

import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { SuccessTxModalType } from 'src/app/shared/components/success-trx-notification/models/modal-type';
import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from 'rubic-sdk';

@Component({
  selector: 'app-success-trx-notification',
  templateUrl: './success-trx-notification.component.html',
  styleUrls: ['./success-trx-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessTrxNotificationComponent {
  public type: SuccessTxModalType;

  public ccrProviderType?: CrossChainTradeType;

  public CROSS_CHAIN_PROVIDER = CROSS_CHAIN_TRADE_TYPE;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      { type: SuccessTxModalType; ccrProviderType: CrossChainTradeType }
    >
  ) {
    this.type = context.data.type;
    this.ccrProviderType = context.data.ccrProviderType;
  }
}

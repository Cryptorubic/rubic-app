import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { SuccessTxModalType } from 'src/app/shared/components/success-trx-notification/models/modal-type';
import {
  CROSS_CHAIN_PROVIDER,
  CrossChainProvider
} from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';

@Component({
  selector: 'polymorpheus-success-trx-notification',
  templateUrl: './success-trx-notification.component.html',
  styleUrls: ['./success-trx-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessTrxNotificationComponent {
  public type: SuccessTxModalType;

  public ccrProviderType?: CrossChainProvider;

  public CROSS_CHAIN_PROVIDER = CROSS_CHAIN_PROVIDER;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      { type: SuccessTxModalType; ccrProviderType: CrossChainProvider }
    >
  ) {
    this.type = context.data.type;
    this.ccrProviderType = context.data.ccrProviderType;
  }
}

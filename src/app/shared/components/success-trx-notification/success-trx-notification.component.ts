import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { SuccessTxModalType } from 'src/app/shared/components/success-trx-notification/models/modal-type';
import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from 'rubic-sdk';
import { CommonModalService } from '@core/services/modal/common-modal.service';
import { HeaderStore } from '@core/header/services/header.store';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

@Component({
  selector: 'app-success-trx-notification',
  templateUrl: './success-trx-notification.component.html',
  styleUrls: ['./success-trx-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessTrxNotificationComponent {
  public type = this.context.data.type;

  public ccrProviderType? = this.context.data.ccrProviderType;

  public CROSS_CHAIN_PROVIDER = CROSS_CHAIN_TRADE_TYPE;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      { type: SuccessTxModalType; ccrProviderType: CrossChainTradeType }
    >,
    private readonly modalService: CommonModalService,
    private readonly headerStore: HeaderStore
  ) {}

  public handleLinkClick(): void {
    // CompleteWith doesn't work.
    (this.context as RubicAny).closeHook();
    this.modalService
      .openRecentTradesModal({
        size: this.headerStore.isMobile ? 'page' : ('xl' as 'l') // hack for custom modal size
      })
      .subscribe();
  }
}

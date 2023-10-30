import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { SuccessTxModalType } from '@shared/components/success-trx-notification/models/modal-type';
import { ModalService } from '@app/core/modals/services/modal.service';
import { HeaderStore } from '@core/header/services/header.store';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/models/tradeHistory';

@Component({
  selector: 'polymorpheus-success-trx-notification',
  templateUrl: './success-trx-notification.component.html',
  styleUrls: ['./success-trx-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessTrxNotificationComponent {
  public readonly type: SuccessTxModalType;

  public readonly withRecentTrades: boolean;

  public get title(): string {
    if (this.type === 'cross-chain-routing') {
      return 'notifications.successfulCCRTradeTitle';
    }
    return 'notifications.successfulTradeTitle';
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      { type: SuccessTxModalType; withRecentTrades: boolean }
    >,
    private readonly modalService: ModalService,
    private readonly windowWidthService: WindowWidthService,
    private readonly headerStore: HeaderStore
  ) {
    this.type = context.data.type;
    this.withRecentTrades = context.data.withRecentTrades;
  }

  public openModal(): void {
    // CompleteWith doesn't work.
    (this.context as RubicAny).closeHook();

    if (this.headerStore.isMobile) {
      this.modalService.openUserProfile(TradesHistory.CROSS_CHAIN).subscribe();
    }
  }
}

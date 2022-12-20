import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { CommonModalService } from '@core/services/modal/common-modal.service';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';
import { SuccessTxModalType } from '@shared/components/success-trx-notification/models/modal-type';

@Component({
  selector: 'polymorpheus-success-trx-notification',
  templateUrl: './success-trx-notification.component.html',
  styleUrls: ['./success-trx-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessTrxNotificationComponent {
  public readonly type: SuccessTxModalType;

  public readonly withRecentTrades: boolean;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      { type: SuccessTxModalType; withRecentTrades: boolean }
    >,
    private readonly modalService: CommonModalService,
    private readonly windowWidthService: WindowWidthService
  ) {
    this.type = context.data.type;
    this.withRecentTrades = context.data.withRecentTrades;
  }

  public openRecentTrades(): void {
    // CompleteWith doesn't work.
    (this.context as RubicAny).closeHook();

    const isDesktop = this.windowWidthService.windowSize === WindowSize.DESKTOP;
    this.modalService
      .openRecentTradesModal({
        size: !isDesktop ? 'page' : ('xl' as 'l') // hack for custom modal size
      })
      .subscribe();
  }
}

import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { ProgressTrxNotificationContext } from '@shared/components/progress-trx-notification/models/progress-trx-notification-context';
import { CommonModalService } from '@core/services/modal/common-modal.service';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';

@Component({
  selector: 'polymorpheus-progress-trx-notification',
  templateUrl: './progress-trx-notification.component.html',
  styleUrls: ['./progress-trx-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressTrxNotificationComponent {
  public readonly withRecentTrades: boolean;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: ProgressTrxNotificationContext,
    private readonly modalService: CommonModalService,
    private readonly windowWidthService: WindowWidthService
  ) {
    this.withRecentTrades = this.context.data?.withRecentTrades || false;
  }

  public openRecentTrades(): void {
    const isDesktop = this.windowWidthService.windowSize === WindowSize.DESKTOP;
    this.modalService
      .openRecentTradesModal({
        size: !isDesktop ? 'page' : ('xl' as 'l') // hack for custom modal size
      })
      .subscribe();
  }
}

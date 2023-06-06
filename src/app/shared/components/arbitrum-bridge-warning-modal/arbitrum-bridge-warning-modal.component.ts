import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { ModalService } from '@core/modals/services/modal.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';

@Component({
  selector: 'app-arbitrum-bridge-warning-modal',
  templateUrl: './arbitrum-bridge-warning-modal.component.html',
  styleUrls: ['./arbitrum-bridge-warning-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArbitrumBridgeWarningModalComponent {
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean>,
    private readonly modalService: ModalService,
    private readonly windowWidthService: WindowWidthService
  ) {}

  public openRecentTrades(): void {
    const isDesktop = this.windowWidthService.windowSize === WindowSize.DESKTOP;
    this.modalService
      .openRecentTradesModal({
        size: !isDesktop ? 'page' : ('xl' as 'l') // hack for custom modal size
      })
      .subscribe();
  }

  public onConfirm(): void {
    this.context.completeWith(true);
  }
}

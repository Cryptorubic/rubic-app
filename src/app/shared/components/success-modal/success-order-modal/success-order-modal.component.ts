import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { Router } from '@angular/router';
import { HeaderStore } from '@core/header/services/header.store';
import { ModalService } from '@core/modals/services/modal.service';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/models/tradeHistory';

@Component({
  selector: 'app-success-order-modal',
  templateUrl: './success-order-modal.component.html',
  styleUrls: ['./success-order-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessOrderModalComponent {
  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean>,
    private readonly router: Router,
    private readonly headerStore: HeaderStore,
    private readonly modalService: ModalService
  ) {}

  public async navigateToOrders(): Promise<void> {
    if (this.isMobile) {
      this.modalService.openUserProfile(TradesHistory.LIMIT_ORDER).subscribe();
    } else {
      await this.router.navigate(['history/limit-orders'], { queryParamsHandling: 'merge' });
      this.context.completeWith(true);
    }
  }

  public onConfirm(): void {
    this.context.completeWith(true);
  }
}

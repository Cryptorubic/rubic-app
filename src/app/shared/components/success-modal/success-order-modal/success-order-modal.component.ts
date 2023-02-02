import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-order-modal',
  templateUrl: './success-order-modal.component.html',
  styleUrls: ['./success-order-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessOrderModalComponent {
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean>,
    private readonly router: Router
  ) {}

  public async navigateToOrders(): Promise<void> {
    await this.router.navigate(['history/limit-orders'], { queryParamsHandling: 'merge' });
    this.context.completeWith(true);
  }

  public onConfirm(): void {
    this.context.completeWith(true);
  }
}

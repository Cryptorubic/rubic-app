import { ChangeDetectionStrategy, Component, Inject, Self } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { timer } from 'rxjs';
import { MODAL_CONFIG } from '@shared/constants/modals/modal-config';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-success-order-modal',
  templateUrl: './success-order-modal.component.html',
  styleUrls: ['./success-order-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SuccessOrderModalComponent {
  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean>
  ) {
    timer(MODAL_CONFIG.modalLifetime)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onConfirm());
  }

  public onConfirm(): void {
    this.context.completeWith(true);
  }
}

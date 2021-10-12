import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { timer } from 'rxjs';
import { modalConfig } from 'src/app/shared/constants/modals/modal-config';
import { takeUntil } from 'rxjs/operators';
import { SuccessTxModalType } from 'src/app/shared/components/success-trx-notification/models/modal-type';

@Component({
  selector: 'polymorpheus-success-tx-modal',
  templateUrl: './success-tx-modal.component.html',
  styleUrls: ['./success-tx-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SuccessTxModalComponent {
  public idPrefix: string;

  public type: SuccessTxModalType;

  constructor(
    private readonly destroy$: TuiDestroyService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      { idPrefix: string; type: SuccessTxModalType }
    >
  ) {
    this.idPrefix = context.data.idPrefix;
    this.type = context.data.type;
    timer(modalConfig.modalLifetime)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onConfirm());
  }

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}

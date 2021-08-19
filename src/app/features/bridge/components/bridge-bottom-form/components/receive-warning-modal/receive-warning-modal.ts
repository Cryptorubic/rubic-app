import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-coinbase-confirm-modal',
  templateUrl: './receive-warning-modal.html',
  styleUrls: ['./receive-warning-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiveWarningModalComponent {
  constructor(@Inject(POLYMORPHEUS_CONTEXT) private context: TuiDialogContext<boolean>) {}

  public onConfirm(): void {
    this.context.completeWith(true);
  }

  public onDecline(): void {
    this.context.completeWith(false);
  }
}

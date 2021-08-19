import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-coinbase-confirm-modal',
  templateUrl: './track-transaction-modal.html',
  styleUrls: ['./track-transaction-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackTransactionModalComponent {
  constructor(@Inject(POLYMORPHEUS_CONTEXT) private context: TuiDialogContext) {}

  public onConfirm(): void {
    this.context.completeWith();
  }
}

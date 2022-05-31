import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'polymorpheus-symbiosis-warning-tx-modal',
  templateUrl: './symbiosis-warning-tx-modal.component.html',
  styleUrls: ['./symbiosis-warning-tx-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SymbiosisWarningTxModalComponent {
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, {}>
  ) {}

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}

import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'polymorpheus-auto-slippage-warning-modal',
  templateUrl: './auto-slippage-warning-modal.component.html',
  styleUrls: ['./auto-slippage-warning-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutoSlippageWarningModalComponent {
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>
  ) {}

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}

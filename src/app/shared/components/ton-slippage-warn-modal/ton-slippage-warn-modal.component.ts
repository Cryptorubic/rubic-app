import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-ton-slippage-warn-modal',
  templateUrl: './ton-slippage-warn-modal.component.html',
  styleUrls: ['./ton-slippage-warn-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TonSlippageWarnModalComponent {
  public readonly providerType: string;

  public readonly slippagePercent: number;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      { providerType: string; slippagePercent: number }
    >
  ) {
    this.providerType = this.context.data.providerType.toLowerCase();
    this.slippagePercent = this.context.data.slippagePercent;
  }

  public confirm(): void {
    this.context.completeWith(true);
  }

  public cancel(): void {
    this.context.completeWith(false);
  }
}

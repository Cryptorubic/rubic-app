import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-settings-warning-modal',
  templateUrl: './settings-warning-modal.component.html',
  styleUrls: ['./settings-warning-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsWarningModalComponent {
  public readonly highSlippage: number;

  public readonly highPriceImpact: number;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      { highSlippage: number; highPriceImpact: number }
    >
  ) {
    this.highSlippage = this.context.data.highSlippage;
    this.highPriceImpact = this.context.data.highPriceImpact;
  }

  public confirm(): void {
    this.context.completeWith(true);
  }

  public cancel(): void {
    this.context.completeWith(false);
  }
}

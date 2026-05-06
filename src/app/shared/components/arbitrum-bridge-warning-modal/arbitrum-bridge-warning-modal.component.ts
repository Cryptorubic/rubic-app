import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-arbitrum-bridge-warning-modal',
  templateUrl: './arbitrum-bridge-warning-modal.component.html',
  styleUrls: ['./arbitrum-bridge-warning-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ArbitrumBridgeWarningModalComponent {
  constructor(@Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean>) {}

  public onConfirm(): void {
    this.context.completeWith(true);
  }
}

import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { XamanSignModalData } from '@core/services/wallets/wallets-adapters/xrpl/models/xaman-sign-modal-data';

@Component({
  standalone: false,
  selector: 'app-xaman-sign-modal',
  templateUrl: './xaman-sign-modal.component.html',
  styleUrls: ['./xaman-sign-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XamanSignModalComponent {
  public readonly data: XamanSignModalData;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, XamanSignModalData>
  ) {
    this.data = context.data;
  }

  public onCancel(): void {
    this.context.completeWith();
  }
}

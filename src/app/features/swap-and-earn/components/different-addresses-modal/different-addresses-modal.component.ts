import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-different-addresses-modal',
  templateUrl: './different-addresses-modal.component.html',
  styleUrls: ['./different-addresses-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DifferentAddressesModalComponent {
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>
  ) {}

  public handleConfirm(): void {
    this.context.completeWith(true);
  }

  public handleCancel(): void {
    this.context.completeWith(false);
  }
}

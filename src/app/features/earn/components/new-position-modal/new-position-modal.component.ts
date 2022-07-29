import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-new-position-modal',
  templateUrl: './new-position-modal.component.html',
  styleUrls: ['./new-position-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewPositionModalComponent {
  public amount: BigNumber;

  public duration: number;

  public unlockDate: number;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<
      boolean,
      { amount: BigNumber; duration: number; unlockDate: number }
    >
  ) {
    this.amount = this.context.data.amount;
    this.duration = this.context.data.duration;
    this.unlockDate = this.context.data.unlockDate;
  }

  public agree(): void {
    this.context.completeWith(true);
  }

  public close(): void {
    this.context.completeWith(false);
  }
}

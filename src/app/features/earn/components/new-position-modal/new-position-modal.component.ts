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
  public readonly amount = this.context.data.amount;

  public readonly duration = this.context.data.duration;

  public readonly unlockDate = this.context.data.unlockDate;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<
      boolean,
      { amount: BigNumber; duration: number; unlockDate: number }
    >
  ) {}
}

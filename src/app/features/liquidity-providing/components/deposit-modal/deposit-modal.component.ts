import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-deposit-modal',
  templateUrl: './deposit-modal.component.html',
  styleUrls: ['./deposit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositModalComponent {
  public amount: BigNumber;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<boolean, { amount: BigNumber }>
  ) {
    this.amount = this.context.data.amount;
  }
}

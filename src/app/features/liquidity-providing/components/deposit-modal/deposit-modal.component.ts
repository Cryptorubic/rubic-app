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
  public usdcAmount: BigNumber;

  public brbcAmount: BigNumber;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<
      boolean,
      { usdcAmount: BigNumber; brbcAmount: BigNumber }
    >
  ) {
    this.usdcAmount = this.context.data.usdcAmount;
    this.brbcAmount = this.context.data.brbcAmount;
  }
}

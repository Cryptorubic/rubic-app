import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-request-withdraw-modal',
  templateUrl: './request-withdraw-modal.component.html',
  styleUrls: ['./request-withdraw-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestWithdrawModalComponent {
  public amount: BigNumber;

  public usdcAmount: BigNumber;

  public brbcAmount: BigNumber;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<
      boolean,
      { brbcAmount: BigNumber; usdcAmount: BigNumber }
    >
  ) {
    this.brbcAmount = this.context.data.brbcAmount;
    this.usdcAmount = this.context.data.usdcAmount;
  }
}

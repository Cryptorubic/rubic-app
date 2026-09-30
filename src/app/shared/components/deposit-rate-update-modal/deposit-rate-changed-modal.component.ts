import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { CrossChainTradeType } from '@cryptorubic/core';

@Component({
  standalone: false,
  selector: 'app-deposit-rate-update-modal',
  templateUrl: './deposit-rate-changed-modal.component.html',
  styleUrls: ['./deposit-rate-changed-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositRateChangedModalComponent {
  public readonly tradeType: CrossChainTradeType;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { tradeType: CrossChainTradeType }>
  ) {
    this.tradeType = context.data.tradeType;
  }

  public backToForm(): void {
    this.context.completeWith(true);
  }
}

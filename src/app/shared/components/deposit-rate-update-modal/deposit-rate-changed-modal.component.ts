import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { SelectedTrade } from '@app/features/trade/models/selected-trade';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { CrossChainTradeType } from 'rubic-sdk';

@Component({
  selector: 'app-deposit-rate-update-modal',
  templateUrl: './deposit-rate-changed-modal.component.html',
  styleUrls: ['./deposit-rate-changed-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositRateChangedModalComponent {
  public readonly tradeType: CrossChainTradeType;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { trade: SelectedTrade }>
  ) {
    this.tradeType = context.data.trade.tradeType as CrossChainTradeType;
  }

  public backToForm(): void {
    this.context.completeWith(true);
  }
}

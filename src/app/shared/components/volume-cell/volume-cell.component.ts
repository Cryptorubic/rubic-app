import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrderBookDataToken } from 'src/app/features/order-book-trade-page/models/trade-data';
import { OrderBookTableTokens } from 'src/app/features/swaps-page/order-books/types/trade-table';

@Component({
  selector: 'app-volume-cell',
  templateUrl: './volume-cell.component.html',
  styleUrls: ['./volume-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VolumeCellComponent {
  @Input() public token: OrderBookTableTokens;

  constructor() {}

  public getProgressBarValue(token: OrderBookDataToken): number {
    return Number(token.amountContributed.div(token.amountTotal).times(100).toFixed());
  }
}

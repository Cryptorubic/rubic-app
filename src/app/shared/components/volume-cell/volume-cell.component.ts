import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {
  OrderBookTableToken,
  OrderBookTableTokens
} from 'src/app/features/swaps-page/order-books/models/trade-table';

@Component({
  selector: 'app-volume-cell',
  templateUrl: './volume-cell.component.html',
  styleUrls: ['./volume-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VolumeCellComponent {
  @Input() public token: OrderBookTableTokens;

  constructor() {}

  public getProgressBarValue(token: OrderBookTableToken): number {
    return Number(token.amountContributed.div(token.amountTotal).times(100).toFixed());
  }
}

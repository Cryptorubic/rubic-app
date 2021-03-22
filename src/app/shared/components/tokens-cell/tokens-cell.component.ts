import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrderBookTableTokens } from 'src/app/features/swaps-page/order-books/types/trade-table';

@Component({
  selector: 'app-tokens-cell',
  templateUrl: './tokens-cell.component.html',
  styleUrls: ['./tokens-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensCellComponent {
  @Input() token: OrderBookTableTokens;

  constructor() {}
}

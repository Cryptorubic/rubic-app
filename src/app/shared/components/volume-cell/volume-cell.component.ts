import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrderBookTableTokens } from 'src/app/features/swaps-page/order-books/types/trade-table';
import { BIG_NUMBER_FORMAT } from '../../constants/formats/BIG_NUMBER_FORMAT';

@Component({
  selector: 'app-volume-cell',
  templateUrl: './volume-cell.component.html',
  styleUrls: ['./volume-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VolumeCellComponent {
  @Input() token: OrderBookTableTokens;

  public BIG_NUMBER_FORMAT = BIG_NUMBER_FORMAT;

  constructor() {}
}

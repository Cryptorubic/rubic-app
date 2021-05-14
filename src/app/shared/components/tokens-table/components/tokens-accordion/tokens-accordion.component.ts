import { Component, ChangeDetectionStrategy, Input, OnInit, Inject } from '@angular/core';
import { WINDOW } from 'src/app/core/models/window';
import { TokensTableData } from '../../models/tokens-table-data';
import { ORDER_BOOK_TRADE_STATUS } from '../../../../../features/order-book-trade-page/models/trade-data';
import { INTSTANT_TRADES_TRADE_STATUS } from '../../../../../features/swaps-page/models/trade-data';

@Component({
  selector: 'app-tokens-accordion',
  templateUrl: './tokens-accordion.component.html',
  styleUrls: ['./tokens-accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensAccordionComponent implements OnInit {
  @Input() data: TokensTableData;

  @Input() chainIconPath: string;

  @Input() selectedOption: string;

  public linkToTrade;

  public get tradeStatusClass() {
    switch (this.data.status as string) {
      case ORDER_BOOK_TRADE_STATUS.ACTIVE:
      case INTSTANT_TRADES_TRADE_STATUS.COMPLETED:
        return 'tokens-accordion__status_green';
      case ORDER_BOOK_TRADE_STATUS.EXPIRED:
      case INTSTANT_TRADES_TRADE_STATUS.PENDING:
        return 'tokens-accordion__status_yellow';
      case ORDER_BOOK_TRADE_STATUS.CANCELLED:
      case INTSTANT_TRADES_TRADE_STATUS.REJECTED:
        return 'tokens-accordion__status_red';
      default:
        return '';
    }
  }

  constructor(@Inject(WINDOW) private readonly window: Window) {}

  ngOnInit(): void {
    this.linkToTrade = `${this.window.location.host}/trade/${this.data.uniqueLink}`;
    console.log(this.selectedOption);
  }
}

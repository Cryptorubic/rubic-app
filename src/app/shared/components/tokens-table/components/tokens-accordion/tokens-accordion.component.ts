import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core';
import { WINDOW } from 'src/app/core/models/window';
import * as moment from 'moment';
import { ORDER_BOOK_TRADE_STATUS } from '../../../../../features/order-book-trade-page-old/models/trade-data';
import { INTSTANT_TRADES_TRADE_STATUS } from '../../../../../features/swaps-page-old/models/trade-data';
import { TradeData } from '../../models/tokens-table-data';
import { ScannerLinkPipe } from '../../../../pipes/scanner-link.pipe';
import ADDRESS_TYPE from '../../../../models/blockchain/ADDRESS_TYPE';

@Component({
  selector: 'app-tokens-accordion',
  templateUrl: './tokens-accordion.component.html',
  styleUrls: ['./tokens-accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensAccordionComponent implements OnInit {
  @Input() data: TradeData;

  @Input() chainIconPath: string;

  @Input() selectedOption: string;

  @Input() tableType: string;

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

  constructor(
    @Inject(WINDOW) private readonly window: Window,
    private scannerLinkPipe: ScannerLinkPipe
  ) {}

  ngOnInit(): void {
    if ('uniqueLink' in this.data) {
      this.linkToTrade = `${this.window.location.host}/trade/${this.data.uniqueLink}`;
    }
  }

  public isFieldIn(fieldName: string) {
    return fieldName in this.data;
  }

  public getLink(part) {
    return this.scannerLinkPipe.transform(part.hash, part.chain, ADDRESS_TYPE.TRANSACTION);
  }

  public getExpirationTime(expirationDate, expiresIn): string {
    if (expirationDate.isAfter(moment.now())) {
      if (expiresIn.years() > 1) {
        return `${expiresIn.years()}y: ${expiresIn.months()}m: ${expiresIn.days()}d: ${expiresIn.hours()}h: ${expiresIn.minutes()}min`;
      }
      return `${expiresIn.days()}d: ${expiresIn.hours()}h: ${expiresIn.minutes()}min`;
    }
    return 'Expired';
  }
}

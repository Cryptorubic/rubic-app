import { Component, Input, OnInit } from '@angular/core';
import { BLOCKCHAIN_NAMES, IToken } from '../trades-form/types';

@Component({
  selector: 'app-order-book',
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.scss']
})
export class OrderBookComponent implements OnInit {
  @Input() blockchain: BLOCKCHAIN_NAMES;
  @Input() baseToken?: IToken = {} as IToken;
  @Input() quoteToken?: IToken = {} as IToken;

  public isCustomTokenSectionOpened = { base: false, quote: false };

  constructor() {}

  ngOnInit() {}

  public onTokenResolve() {}
}

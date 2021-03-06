import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import { IToken } from '../trades-form/types';
import { TokenInfoBody } from './types';
import { NgModel } from '@angular/forms';
import { BLOCKCHAIN_NAME } from '../../../services/blockchain/types/Blockchain';

const MY_FORMATS = {
  useUtc: true,
  parse: {
    dateInput: 'LL'
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'X',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'app-order-book',
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS
    }
  ]
})
export class OrderBookComponent implements OnInit {
  @Input() set blockchain(value: BLOCKCHAIN_NAME) {
    this._blockchain = value;

    setTimeout(() => this.updateCustomTokenAddresses());
  }

  get blockchain() {
    return this._blockchain;
  }

  @Input() tokens = {
    base: {} as IToken,
    quote: {} as IToken
  };

  @ViewChild('baseCustomToken') baseCustomToken: NgModel;
  @ViewChild('quoteCustomToken') quoteCustomToken: NgModel;

  private _blockchain;

  public isCustomTokenSectionOpened = {
    base: false,
    quote: false
  };
  public customTokens = {
    base: {} as IToken,
    quote: {} as IToken
  };

  public isAdvancedSectionOpened: boolean = false;

  public closingDate: moment.Moment;
  public minClosingDate: moment.Moment;
  public closingTime: string;
  public minClosingTime: string;

  public isPublicDeal: boolean;

  constructor() {
    this.setAdvancedOptions();
  }

  ngOnInit() {}

  private static timeToString(time: moment.Moment): string {
    return time.hour() + ':' + time.minute();
  }

  private setAdvancedOptions(): void {
    this.setClosingDate();
    this.isPublicDeal = true;
  }

  private setClosingDate(): void {
    const currentTime = moment();

    this.minClosingDate = moment(currentTime).add(1, 'hour');
    this.closingDate = moment(currentTime).add(1, 'week');

    this.closingTime = OrderBookComponent.timeToString(currentTime);
    this.minClosingTime = null;

    // updates once in 10 minutes
    setInterval(() => {
      this.minClosingDate = moment().add(1, 'hour');
      this.onDateChanges();
    }, 600_000);
  }

  /**
   * @description Checks that mininum closing time is correct. It must be one hour later, than current time.
   */
  public onDateChanges(): void {
    if (this.closingDate.isSame(this.minClosingDate, 'day')) {
      this.minClosingTime = OrderBookComponent.timeToString(this.minClosingDate);

      const [closingTimeHour, closingTimeMinute] = this.closingTime
        .split(':')
        .map(t => parseInt(t));
      if (
        this.minClosingDate.hour() > closingTimeHour ||
        (this.minClosingDate.hour() === closingTimeHour &&
          this.minClosingDate.minute() > closingTimeMinute)
      ) {
        this.closingTime = OrderBookComponent.timeToString(this.minClosingDate);
      }
    } else {
      this.minClosingTime = null;
    }
  }

  public addCustomToken(tokenPart: string, tokenBody: TokenInfoBody): void {
    this.customTokens[tokenPart].token_title = tokenBody.name;
    this.customTokens[tokenPart].token_short_title = tokenBody.symbol;
    this.customTokens[tokenPart].decimals = tokenBody.decimals;
  }

  public setCustomToken(tokenPart: string) {
    this.tokens[tokenPart] = this.customTokens[tokenPart];
  }

  private updateCustomTokenAddresses(): void {
    if (this.baseCustomToken) {
      this.baseCustomToken.control.updateValueAndValidity();
    }
    if (this.quoteCustomToken) {
      this.quoteCustomToken.control.updateValueAndValidity();
    }
  }
}

import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import { BLOCKCHAIN_NAMES, IToken } from '../trades-form/types';
import { MY_FORMATS } from '../../../index/start-form/start-form.component';

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
  @Input() blockchain: BLOCKCHAIN_NAMES;
  @Input() baseToken?: IToken = {} as IToken;
  @Input() quoteToken?: IToken = {} as IToken;

  public isCustomTokenSectionOpened = { base: false, quote: false };

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
}

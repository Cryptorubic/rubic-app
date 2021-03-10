import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import * as moment from 'moment';
import BigNumber from 'bignumber.js';
import { NgModel } from '@angular/forms';
import { OrderBookToken, TokenPart, TradeInfo } from 'src/app/core/services/order-book/types';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

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
  selector: 'app-order-book-advanced-options',
  templateUrl: './order-book-advanced-options.component.html',
  styleUrls: ['./order-book-advanced-options.component.scss'],
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
export class OrderBookAdvancedOptionsComponent implements OnInit {
  @Input()
  get tradeInfo(): TradeInfo {
    return this._tradeInfo;
  }

  @Output() tradeInfoChange = new EventEmitter<TradeInfo>();

  set tradeInfo(value: TradeInfo) {
    this._tradeInfo = value;
    this.tradeInfoChange.emit(this._tradeInfo);

    this.checkIfAmountAndAddressesAreSet();
    this.checkIfOptionsAreValid();
  }

  @Output() validChange = new EventEmitter<boolean>();

  @ViewChild('baseMinContribute') baseMinContribute: NgModel;

  @ViewChild('quoteMinContribute') quoteMinContribute: NgModel;

  @ViewChild('brokerAddress') brokerAddress: NgModel;

  @ViewChild('baseBrokerPercent') baseBrokerPercent: NgModel;

  @ViewChild('quoteBrokerPercent') quoteBrokerPercent: NgModel;

  private _tradeInfo: TradeInfo;

  public closingDate: moment.Moment;

  public minClosingDate: moment.Moment;

  public closingTime: string;

  public minClosingTime: string;

  private readonly defaultTokenOptions = {
    minContribution: '',
    brokerPercent: '0.1'
  } as OrderBookToken;

  public areAmountAndAddressesSet: boolean;

  constructor() {}

  private static timeToString(time: moment.Moment): string {
    return `${time.hour()}:${time.minute()}`;
  }

  ngOnInit(): void {
    this.setAdvancedOptions();
  }

  private setAdvancedOptions(): void {
    this.setClosingDate();
    this.tradeInfo = {
      ...this.tradeInfo,
      isPublic: true,
      isWithBrokerFee: false,
      tokens: {
        base: {
          ...this.tradeInfo.tokens.base,
          ...this.defaultTokenOptions
        },
        quote: {
          ...this.tradeInfo.tokens.quote,
          ...this.defaultTokenOptions
        }
      }
    };
  }

  private setClosingDate(): void {
    const currentTime = moment();

    this.minClosingDate = currentTime.clone().add(1, 'hour');
    this.closingDate = currentTime.clone().add(1, 'week');

    this.closingTime = OrderBookAdvancedOptionsComponent.timeToString(currentTime);
    this.minClosingTime = null;

    this.onStopDateChange();

    const TEN_MINUTES = 600_000;
    setInterval(() => {
      this.minClosingDate = moment().add(1, 'hour');
      this.onDateChange();
    }, TEN_MINUTES);
  }

  /**
   * @description checks that minimum closing time is correct - it must be one hour later, than current time.
   * Changes stop date.
   */
  public onDateChange(): void {
    if (this.closingDate.isSame(this.minClosingDate, 'day')) {
      this.minClosingTime = OrderBookAdvancedOptionsComponent.timeToString(this.minClosingDate);

      const [closingTimeHour, closingTimeMinute] = this.closingTime
        .split(':')
        .map(t => parseInt(t));
      if (
        this.minClosingDate.hour() > closingTimeHour ||
        (this.minClosingDate.hour() === closingTimeHour &&
          this.minClosingDate.minute() > closingTimeMinute)
      ) {
        this.closingTime = OrderBookAdvancedOptionsComponent.timeToString(this.minClosingDate);
      }
    } else {
      this.minClosingTime = null;
    }

    this.onStopDateChange();
  }

  public onTimeChange(): void {
    this.onStopDateChange();
  }

  private onStopDateChange(): void {
    const stopDate = this.closingDate.clone();
    const [hour, minute] = this.closingTime.split(':').map(t => parseInt(t));
    stopDate.hour(hour);
    stopDate.minute(minute);

    this.tradeInfo = {
      ...this.tradeInfo,
      stopDate: stopDate.utc().format('YYYY-MM-DD HH:mm')
    };
  }

  public onIsPublicChange(isPublic: boolean): void {
    this.tradeInfo = {
      ...this.tradeInfo,
      isPublic
    };
  }

  public checkIfAmountAndAddressesAreSet(): void {
    this.areAmountAndAddressesSet = !!(
      this.tradeInfo.tokens.base.address &&
      this.tradeInfo.tokens.base.amount &&
      this.tradeInfo.tokens.quote.address &&
      this.tradeInfo.tokens.quote.amount
    );
  }

  public onMinContributeChange(tokenPart: TokenPart, minContribution: string): void {
    this.tradeInfo = {
      ...this.tradeInfo,
      tokens: {
        ...this.tradeInfo.tokens,
        [tokenPart]: {
          ...this.tradeInfo.tokens[tokenPart],
          minContribution
        }
      }
    };
  }

  public onIsWithBrokerFeeChange(isWithBrokerFee: boolean): void {
    this.tradeInfo = {
      ...this.tradeInfo,
      isWithBrokerFee
    };
  }

  public onBrokerAddressChange(brokerAddress: string): void {
    this.tradeInfo = {
      ...this.tradeInfo,
      brokerAddress
    };
  }

  public onBrokerPercentChange(tokenPart: TokenPart, brokerPercent): void {
    this.tradeInfo = {
      ...this.tradeInfo,
      tokens: {
        ...this.tradeInfo.tokens,
        [tokenPart]: {
          ...this.tradeInfo.tokens[tokenPart],
          brokerPercent
        }
      }
    };
  }

  public getBrokerPercent(tokenPart: TokenPart): string {
    const { brokerPercent } = this.tradeInfo.tokens[tokenPart];
    return brokerPercent
      ? new BigNumber(this.tradeInfo.tokens[tokenPart].brokerPercent)
          .times(this.tradeInfo.tokens[tokenPart].amount)
          .div(100)
          .toString()
      : '0';
  }

  public checkIfOptionsAreValid(): void {
    const areValid =
      (!this.baseMinContribute || this.baseMinContribute.valid) &&
      (!this.quoteMinContribute || this.quoteMinContribute.valid) &&
      (!this.tradeInfo.isWithBrokerFee ||
        (this.brokerAddress?.value &&
          this.brokerAddress?.valid &&
          this.baseBrokerPercent?.valid &&
          this.quoteBrokerPercent?.valid));
    this.validChange.emit(areValid);
  }
}

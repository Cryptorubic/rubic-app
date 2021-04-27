import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { NgModel } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { OrderBookTokenPart } from 'src/app/shared/models/order-book/tokens';
import BigNumber from 'bignumber.js';
import { OrderBooksFormService } from '../services/order-books-form.service';
import { OrderBookFormToken, OrderBookTradeForm } from '../../../models/trade-form';

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
  selector: 'app-order-books-form-options',
  templateUrl: './order-books-form-options.component.html',
  styleUrls: ['./order-books-form-options.component.scss'],
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
export class OrderBooksFormOptionsComponent implements OnInit, OnDestroy {
  @ViewChild('baseMinContribute') baseMinContribute: NgModel;

  @ViewChild('quoteMinContribute') quoteMinContribute: NgModel;

  @ViewChild('brokerAddress') brokerAddress: NgModel;

  @ViewChild('baseBrokerPercent') baseBrokerPercent: NgModel;

  @ViewChild('quoteBrokerPercent') quoteBrokerPercent: NgModel;

  private _tradeForm: OrderBookTradeForm;

  private tradeFormSubscription$: Subscription;

  public closingDate: moment.Moment;

  public minClosingDate: moment.Moment;

  public closingTime: string;

  public minClosingTime: string;

  private readonly defaultTokenOptions = {
    minContribution: '',
    brokerPercent: '0.1'
  } as OrderBookFormToken;

  public _areAdvancedOptionsOpened = false;

  get areAdvancedOptionsOpened(): boolean {
    return this._areAdvancedOptionsOpened;
  }

  set areAdvancedOptionsOpened(value) {
    this._areAdvancedOptionsOpened = value;

    this.tradeForm = {
      ...this.tradeForm,
      areOptionsValid: this.areOptionsValid()
    };
  }

  get tradeForm(): OrderBookTradeForm {
    return this._tradeForm;
  }

  set tradeForm(value: OrderBookTradeForm) {
    this._tradeForm = value;
    this._tradeForm.areOptionsValid = this.areOptionsValid();
    this.orderBookFormService.setTradeForm(this._tradeForm);
  }

  constructor(private orderBookFormService: OrderBooksFormService) {}

  private static timeToString(time: moment.Moment): string {
    return `${time.hour()}:${time.minute()}`;
  }

  ngOnInit(): void {
    this.tradeFormSubscription$ = this.orderBookFormService.getTradeForm().subscribe(tradeForm => {
      this._tradeForm = tradeForm;

      setTimeout(() => {
        this.updateMinContributionsValidity();

        if (this._tradeForm.areOptionsValid !== this.areOptionsValid()) {
          this.tradeForm = {
            ...this._tradeForm,
            areOptionsValid: this.areOptionsValid()
          };
        }
      });
    });

    this.setAdvancedOptions();
  }

  ngOnDestroy(): void {
    this.tradeFormSubscription$.unsubscribe();
  }

  private updateMinContributionsValidity(): void {
    this.baseMinContribute?.control.updateValueAndValidity();
    this.quoteMinContribute?.control.updateValueAndValidity();
  }

  private areOptionsValid(): boolean {
    return (
      !this.areAdvancedOptionsOpened ||
      ((!this.baseMinContribute || this.baseMinContribute.valid) &&
        (!this.quoteMinContribute || this.quoteMinContribute.valid) &&
        (!this.tradeForm.isWithBrokerFee ||
          (this.brokerAddress?.value &&
            this.brokerAddress?.valid &&
            this.baseBrokerPercent?.valid &&
            this.quoteBrokerPercent?.valid)))
    );
  }

  private setAdvancedOptions(): void {
    this.setClosingDate();

    this.tradeForm = {
      ...this.tradeForm,
      isPublic: true,
      isWithBrokerFee: false,
      token: {
        from: {
          ...this.tradeForm.token.from,
          ...this.defaultTokenOptions
        },
        to: {
          ...this.tradeForm.token.to,
          ...this.defaultTokenOptions
        }
      }
    };
  }

  private setClosingDate(): void {
    const currentTime = moment.utc();

    this.minClosingDate = currentTime.clone().add(1, 'hour');
    this.closingDate = currentTime.clone().add(1, 'week');

    this.closingTime = OrderBooksFormOptionsComponent.timeToString(currentTime);
    this.minClosingTime = null;

    this.onStopDateChange();

    const TEN_MINUTES = 600_000;
    setInterval(() => {
      this.minClosingDate = moment.utc().add(1, 'hour');
      this.onDateChange();
    }, TEN_MINUTES);
  }

  /**
   * @description checks that minimum closing time is correct - it must be one hour later, than current time.
   * Changes stop date.
   */
  public onDateChange(): void {
    if (this.closingDate.isSame(this.minClosingDate, 'day')) {
      this.minClosingTime = OrderBooksFormOptionsComponent.timeToString(this.minClosingDate);

      const [closingTimeHour, closingTimeMinute] = this.closingTime
        .split(':')
        .map(t => parseInt(t));
      if (
        this.minClosingDate.hour() > closingTimeHour ||
        (this.minClosingDate.hour() === closingTimeHour &&
          this.minClosingDate.minute() > closingTimeMinute)
      ) {
        this.closingTime = OrderBooksFormOptionsComponent.timeToString(this.minClosingDate);
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

    this.tradeForm = {
      ...this.tradeForm,
      stopDate: stopDate.format('YYYY-MM-DD HH:mm')
    };
  }

  public onIsPublicChange(isPublic: boolean): void {
    this.tradeForm = {
      ...this.tradeForm,
      isPublic
    };
  }

  public onMinContributeChange(
    tokenPart: OrderBookTokenPart,
    minContributionAsString: string
  ): void {
    const minContribution = minContributionAsString.split(',').join('');
    this.tradeForm = {
      ...this.tradeForm,
      token: {
        ...this.tradeForm.token,
        [tokenPart]: {
          ...this.tradeForm.token[tokenPart],
          minContribution
        }
      }
    };
  }

  public onIsWithBrokerFeeChange(isWithBrokerFee: boolean): void {
    this.tradeForm = {
      ...this.tradeForm,
      isWithBrokerFee
    };
  }

  public onBrokerAddressChange(brokerAddress: string): void {
    this.tradeForm = {
      ...this.tradeForm,
      brokerAddress
    };
  }

  public onBrokerPercentChange(tokenPart: OrderBookTokenPart, brokerPercent): void {
    this.tradeForm = {
      ...this.tradeForm,
      token: {
        ...this.tradeForm.token,
        [tokenPart]: {
          ...this.tradeForm.token[tokenPart],
          brokerPercent
        }
      }
    };
  }

  public getBrokerPercent(tokenPart: OrderBookTokenPart): string {
    const { brokerPercent } = this.tradeForm.token[tokenPart];
    return brokerPercent
      ? new BigNumber(this.tradeForm.token[tokenPart].amount)
          .times(this.tradeForm.token[tokenPart].brokerPercent)
          .div(100)
          .toString()
      : '0';
  }
}

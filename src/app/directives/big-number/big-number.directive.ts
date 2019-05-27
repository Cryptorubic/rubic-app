import {Directive, Injector, Input, OnInit, Pipe, PipeTransform} from '@angular/core';
import {NgControl} from '@angular/forms';
import BigNumber from 'bignumber.js';

@Directive({
  selector: '[appBigNumber]'
})
export class BigNumberDirective implements OnInit {

  private control: NgControl;
  private latestValue;
  private decimalPart;
  private oldDecimal;

  private currentDecimals: number;

  private withEndPoint;

  @Input ('appBigNumber') appBigNumber;
  @Input ('ngModel') ngModel;

  @Input ('decimalsChange') decimalsChange;
  @Input ('minValueChange') minValueChange;
  @Input ('maxValueChange') maxValueChange;

  @Input ('required') required;

  constructor(
    private injector: Injector,
  ) {
    this.control = this.injector.get(NgControl);
  }

  ngOnInit() {

    const originalWriteVal = this.control.valueAccessor.writeValue.bind(this.control.valueAccessor);
    this.control.valueAccessor.writeValue = (value) => originalWriteVal(this.maskValue(value));

    this.currentDecimals = !isNaN(this.appBigNumber.decimals) ? parseInt(this.appBigNumber.decimals, 10) : 0;

    if (this.decimalsChange) {
      this.decimalsChange.subscribe((decimals) => {

        this.oldDecimal = this.appBigNumber.decimals;
        this.appBigNumber.decimals = decimals;

        this.currentDecimals = !isNaN(decimals) ? parseInt(decimals, 10) : 0;
        this.control.control.setValue(
          this.latestValue
        );
        this.oldDecimal = undefined;
      });
    }


    if (this.minValueChange) {
      this.minValueChange.subscribe(() => {
        setTimeout(() => {
          this.control.control.setValue(
            this.latestValue
          );
        });
      });
    }

    if (this.maxValueChange) {
      this.maxValueChange.subscribe(() => {
        setTimeout(() => {
          this.control.control.setValue(
            this.latestValue
          );
        });
      });
    }


    this.control.valueChanges.subscribe((result: string) => {

      const is10 = (this.latestValue + '0') === result;

      if ((result !== '') && (result === this.ngModel) && (this.oldDecimal === undefined) && !is10) {
        result = new BigNumber(result).div(Math.pow(10, this.currentDecimals)).toString(10);
      }


      result = result || '';

      let originalValue = result.split(',').join('').replace(/\.$/, '');

      if (new BigNumber(originalValue).isNaN()) {
        originalValue = (result !== '') ? this.latestValue : '';
      } else {
        const fixedResult = result.replace(/\.+$/, '.');
        this.withEndPoint = fixedResult.indexOf('.') === (fixedResult.length - 1);
        this.decimalPart = originalValue ? result.split('.')[1] : '';
      }

      this.latestValue = originalValue;

      let bigNumberValue = new BigNumber(originalValue);

      const errors: any = {};

      let decimalsValue;

      if (!originalValue || bigNumberValue.isNaN()) {
        if (originalValue) {
          errors.pattern = true;
        } else if (this.required) {
          errors.required = true;
        }
      } else {

        if (this.decimalPart && (this.decimalPart.length > this.currentDecimals)) {
          bigNumberValue = bigNumberValue.dp(this.currentDecimals);
        }

        decimalsValue = bigNumberValue.times(Math.pow(10, this.currentDecimals));

        if (decimalsValue.div(Math.pow(2, 256) - 1).toNumber() > 1) {
          errors.totalMaximum = true;
        }

        if (decimalsValue.minus(this.appBigNumber.min).toNumber() < 0) {
          errors.min = true;
        }

        if (decimalsValue.minus(this.appBigNumber.max).toNumber() > 0) {
          errors.max = true;
        }
      }

      const modelValue = decimalsValue ? decimalsValue.toString(10) : '';

      if (JSON.stringify(errors) === '{}') {
        this.control.control.setValue(modelValue, {
          emitEvent: false
        });
        this.control.control.setErrors(null);
      } else {
        if (modelValue) {
          this.control.control.markAsTouched();
        }
        this.control.control.setValue(modelValue, {
          emitEvent: false
        });
        this.control.control.setErrors(errors);
      }

    });
  }

  private maskValue(value) {
    const visibleValue = this.latestValue ?
      new BigNumber(this.latestValue) :
      (value ? new BigNumber(value).div(Math.pow(10, this.currentDecimals)) : '');


    return visibleValue ?
      visibleValue.toFormat(
        Math.min(this.decimalPart ? this.decimalPart.length : 0, this.currentDecimals || 0),
        {groupSeparator: ',', groupSize: 3, decimalSeparator: '.'}) + (this.withEndPoint ? '.' : ''
      ) : '';
  }

}


@Pipe({ name: 'bigNumberFormat' })
export class BigNumberFormat implements PipeTransform {
  transform(value, decimals, format, asBN, round) {

    const formatNumberParams = {groupSeparator: ',', groupSize: 3, decimalSeparator: '.'};

    const bigNumberValue = new BigNumber(value).div(Math.pow(10, decimals));

    if (bigNumberValue.isNaN()) {
      return value;
    }

    if (format) {
      return bigNumberValue.dp(round || decimals).toFormat(formatNumberParams);
    } else if (!asBN) {
      return bigNumberValue.toString(10);
    } else {
      return bigNumberValue;
    }
  }
}


@Pipe({ name: 'bigNumberMin' })
export class BigNumberMin implements PipeTransform {
  transform(values) {
    return BigNumber.min.apply(null, values);
  }
}
@Pipe({ name: 'bigNumberMax' })
export class BigNumberMax implements PipeTransform {
  transform(values) {
    return BigNumber.max.apply(null, values);
  }
}


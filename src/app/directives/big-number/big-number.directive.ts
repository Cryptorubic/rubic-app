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

  private withEndPoint;

  @Input ('appBigNumber') appBigNumber;
  @Input ('ngModel') ngModel;
  @Input ('decimalsChange') decimalsChange;
  @Input ('required') required;

  constructor(
    private injector: Injector,
  ) {
    this.control = this.injector.get(NgControl);
  }

  ngOnInit() {

    const originalWriteVal = this.control.valueAccessor.writeValue.bind(this.control.valueAccessor);
    this.control.valueAccessor.writeValue = (value) => originalWriteVal(this.maskValue(value));


    if (this.decimalsChange) {
      this.decimalsChange.subscribe((tokenInfo) => {
        this.oldDecimal = this.appBigNumber.decimals;
        this.appBigNumber.decimals = tokenInfo.token.decimals;
        this.control.control.setValue(
          this.latestValue
        );
        this.oldDecimal = undefined;
      });
    }


    this.control.valueChanges.subscribe((result: string) => {

      if ((result !== '') && (result === this.ngModel) && (this.oldDecimal === undefined)) {
        result = new BigNumber(result).div(Math.pow(10, this.appBigNumber.decimals)).toString(10);
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

        if (this.decimalPart && (this.decimalPart.length > this.appBigNumber.decimals)) {
          bigNumberValue = bigNumberValue.dp(this.appBigNumber.decimals);
        }

        decimalsValue = bigNumberValue.times(Math.pow(10, this.appBigNumber.decimals));

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
        this.control.control.setValue(modelValue, { emitEvent: false });
        this.control.control.setErrors(null);
      } else {
        this.control.control.setValue('', { emitEvent: false });
        this.control.control.setErrors(errors);
      }

    });
  }

  private maskValue(value) {
    const visibleValue = this.latestValue ?
      new BigNumber(this.latestValue) :
      (value ? new BigNumber(value).div(Math.pow(10, this.appBigNumber.decimals)) : '');

    return visibleValue ?
      visibleValue.toFormat(
          Math.min(this.decimalPart ? this.decimalPart.length : 0, this.appBigNumber.decimals),
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


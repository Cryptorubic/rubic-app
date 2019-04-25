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

  private withEndPoint;

  @Input ('appBigNumber') appBigNumber;
  @Input ('ngModel') ngModel;
  @Input ('decimalsChange') decimalsChange;

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
        this.appBigNumber.decimals = tokenInfo.token.decimals;
        if (this.latestValue && !(this.latestValue.isNaN())) {
          this.control.control.setValue(
            this.latestValue.times(Math.pow(10, tokenInfo.token.decimals)).toString(10),
            {
              emitEvent: false
            }
          );
        }
      });
    }


    this.control.valueChanges.subscribe((result) => {

      if (result === this.ngModel) {
        result = new BigNumber(result).div(Math.pow(10, this.appBigNumber.decimals)).toString(10);
      }

      result = result || '';
      const originalValue = result.split(',').join('').replace(/\.$/, '');
      let bigNumberValue = new BigNumber(originalValue);

      if (bigNumberValue.isNaN()) {
        bigNumberValue = (result !== '') ? this.latestValue : '';
      } else {
        const fixedResult = result.replace(/\.+$/, '.');
        this.withEndPoint = fixedResult.indexOf('.') === (fixedResult.length - 1);

        const stringValue = bigNumberValue ? bigNumberValue.toString(10) : '';
        this.decimalPart = stringValue ? result.split('.')[1] : '';
      }



      const errors: any = {};

      let decimalsValue;

      if (!bigNumberValue || bigNumberValue.isNaN()) {
        if (bigNumberValue) {
          errors.pattern = true;
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

      this.latestValue = bigNumberValue;
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

    const visibleValue = this.latestValue ||
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


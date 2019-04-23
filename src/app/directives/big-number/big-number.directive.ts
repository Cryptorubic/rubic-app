import {Directive, Injector, Input, OnInit, Pipe, PipeTransform} from '@angular/core';
import {NgControl} from '@angular/forms';
import BigNumber from 'bignumber.js';

@Directive({
  selector: '[appBigNumber]'
})
export class BigNumberDirective implements OnInit {

  private control: NgControl;
  private latestValue;

  private withEndPoint;

  @Input ('appBigNumber') appBigNumber;
  @Input ('ngModel') ngModel;

  constructor(
    private injector: Injector,
  ) {
    this.control = this.injector.get(NgControl);
  }

  ngOnInit() {

    const originalWriteVal = this.control.valueAccessor.writeValue.bind(this.control.valueAccessor);
    this.control.valueAccessor.writeValue = (value) => originalWriteVal(this.maskValue(value));

    this.control.valueChanges.subscribe((result) => {

      if (result === this.ngModel) {
        return;
      }

      result = result || '';
      const originalValue = result.split(',').join('').replace(/\.$/, '');
      let bigNumberValue = new BigNumber(originalValue);

      if (bigNumberValue.isNaN()) {
        bigNumberValue = (result !== '') ? this.latestValue : '';
      } else {
        bigNumberValue = bigNumberValue.dp(50);
        this.withEndPoint = result.indexOf('.') === (result.length - 1);
      }

      const stringValue = bigNumberValue ? bigNumberValue.toString(10) : '';
      const decimalPart = stringValue.split('.')[1];

      const errors: any = {};

      let decimalsValue;

      if (!bigNumberValue || bigNumberValue.isNaN()) {
        errors.pattern = true;
      } else {

        decimalsValue = bigNumberValue.times(Math.pow(10, this.appBigNumber.decimals));

        if (decimalPart && (decimalPart.length > this.appBigNumber.decimals)) {
          errors.decimals = true;
        }

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
      const modelValue = decimalsValue || '';
      this.control.control.setValue(modelValue, { emitEvent: false });
      this.control.control.setErrors((JSON.stringify(errors) !== '{}') ? errors : null);
    });
  }

  private maskValue(value) {
    return value ?
      new BigNumber(value)
        .div(Math.pow(10, this.appBigNumber.decimals))
        .toFormat({groupSeparator: ',', groupSize: 3, decimalSeparator: '.'}) + (this.withEndPoint ? '.' : '') : '';
  }


}


@Pipe({ name: 'bigNumberFormat' })
export class BigNumberFormat implements PipeTransform {
  transform(value, decimals, format) {

    const formatNumberParams = {groupSeparator: ',', groupSize: 3, decimalSeparator: '.'};

    const bigNumberValue = new BigNumber(value).div(Math.pow(10, decimals));
    if (format) {
      return bigNumberValue.toFormat(formatNumberParams);
    } else {
      return bigNumberValue.toString(10);
    }
  }
}


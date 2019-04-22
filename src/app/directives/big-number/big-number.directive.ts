import {Directive, Injector, Input, OnInit} from '@angular/core';
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

      if (!bigNumberValue || bigNumberValue.isNaN()) {
        errors.pattern = true;
      } else {

        if (decimalPart && (decimalPart.length > this.appBigNumber.decimals)) {
          errors.decimals = true;
        }

        if (bigNumberValue.times(Math.pow(10, this.appBigNumber.decimals)).div(Math.pow(2, 256) - 1).toNumber() > 1) {
          errors.totalMaximum = true;
        }

        if (bigNumberValue.minus(this.appBigNumber.min).toNumber() < 0) {
          errors.min = true;
        }

        if (bigNumberValue.minus(this.appBigNumber.max).toNumber() > 0) {
          errors.max = true;
        }
      }

      this.latestValue = bigNumberValue;
      const modelValue = bigNumberValue ? bigNumberValue.times(Math.pow(10, this.appBigNumber.decimals)).toString(10) : '';
      this.control.control.setValue(modelValue, { emitEvent: false });
      this.control.control.setErrors((JSON.stringify(errors) !== '{}') ? errors : null);
    });
  }

  private maskValue(value) {
    return value ?
      new BigNumber(value)
        .div(Math.pow(10, this.appBigNumber.decimals))
        .toFormat({groupSeparator: ',', groupSize: 3, decimalSeparator: '.'}) : '';
  }


}

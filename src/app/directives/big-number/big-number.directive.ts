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
  constructor(
    private injector: Injector,
  ) {
  }

  ngOnInit() {
    this.control = this.injector.get(NgControl);

    const originalWriteVal = this.control.valueAccessor.writeValue.bind(this.control.valueAccessor);
    this.control.valueAccessor.writeValue = (value) => originalWriteVal(this.maskValue());

    this.control.valueChanges.subscribe((result) => {

      console.log(this.appBigNumber);

      const originalValue = result.split(',').join('').replace(/\.$/, '');

      let bigNumberValue = new BigNumber(originalValue);

      if (bigNumberValue.isNaN()) {
        bigNumberValue = this.latestValue;
      } else {
        bigNumberValue = bigNumberValue.dp(50);
        this.withEndPoint = result.indexOf('.') === (result.length - 1);
      }

      const stringValue = this.latestValue ? this.latestValue.toString(10) : '';
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

      console.log(errors);



      this.latestValue = bigNumberValue;
      this.control.control.setValue(stringValue, { emitEvent: false });
    });
  }

  private maskValue() {
    return this.latestValue ?
      this.latestValue.toFormat({groupSeparator: ',', groupSize: 3, decimalSeparator: '.'}) + (this.withEndPoint ? '.' : '') : '';
  }


}

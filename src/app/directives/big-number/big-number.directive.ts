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
      const originalValue = result.split(',').join('').replace(/\.$/, '');

      let bigNumberValue = new BigNumber(originalValue);

      if (bigNumberValue.isNaN()) {
        bigNumberValue = this.latestValue;
      } else {
        this.withEndPoint = result.indexOf('.') === (result.length - 1);
      }

      this.latestValue = bigNumberValue;
      this.control.control.setValue(this.latestValue ? this.latestValue.toString() : '', { emitEvent: false });
    });
  }

  private maskValue() {
    return this.latestValue ?
      this.latestValue.toFormat({groupSeparator: ',', groupSize: 3, decimalSeparator: '.'}) + (this.withEndPoint ? '.' : '') : '';
  }


}

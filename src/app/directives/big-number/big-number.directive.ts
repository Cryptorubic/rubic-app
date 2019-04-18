import {Directive, Injector, Input, OnInit} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[appBigNumber]'
})
export class BigNumberDirective implements OnInit {

  private control: NgControl;
  @Input ('appBigNumber') appBigNumber;
  constructor(
    private injector: Injector,
  ) {
  }

  ngOnInit() {
    this.control = this.injector.get(NgControl);

    const originalWriteVal = this.control.valueAccessor.writeValue.bind(this.control.valueAccessor);
    this.control.valueAccessor.writeValue = (val: any) => originalWriteVal(this._maskValue(val));

    const originalChange = ( <any> this.control.valueAccessor).onChange.bind(this.control.valueAccessor);
    this.control.valueAccessor.registerOnChange((val: any) => originalChange(this._unmaskValue(val)));

    this._setVal(this._maskValue(this.control.value));

  }

  private _maskValue(val: string): string {

    return this.valueToFormat(val);
  }

  private _unmaskValue(val: string): string {
    const maskedVal = this._maskValue(val);

    if (maskedVal !== val) {
      this._setVal(maskedVal);
    }

    return maskedVal;
  }

  private valueToFormat(val) {
    return val;
  }

  private _setVal(val: string) {
    if (this.control.control) {
      this.control.control.setValue(val, { emitEvent: false });
    }
  }
}

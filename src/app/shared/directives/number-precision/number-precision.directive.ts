import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import BigNumber from 'bignumber.js';

@Directive({
  selector: '[appNumberPrecision]',
  providers: [
    {
      provide: NG_VALIDATORS,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: NumberPrecisionDirective,
      multi: true
    }
  ]
})
export class NumberPrecisionDirective implements Validator {
  // eslint-disable-next-line no-magic-numbers
  @Input() integerLength? = 32; // 32 is default length of integer part of token's amount

  // eslint-disable-next-line no-magic-numbers
  @Input() decimalLength = 8; // 8 is default length of decimal part of token's amount

  @Input() minValue: string;

  @Input() maxValue: string;

  private readonly decimalNumberRegex = /^[0-9]+\.?[0-9]*$/;

  private lastValidValue: string = '';

  constructor() {}

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      this.lastValidValue = '';
      return null;
    }

    if (!control.value.match(this.decimalNumberRegex)) {
      control.setValue(this.lastValidValue);
      return this.validate(control);
    }

    const [integerPart, fractionalPart] = control.value.split('.');
    if (
      integerPart.length > this.integerLength ||
      (fractionalPart && fractionalPart.length > this.decimalLength)
    ) {
      control.setValue(this.lastValidValue);
      return this.validate(control);
    }
    this.lastValidValue = control.value;

    if (this.minValue && new BigNumber(control.value).isLessThan(this.minValue)) {
      return { overflowMinValue: true };
    }

    if (this.maxValue && new BigNumber(control.value).isGreaterThan(this.maxValue)) {
      return { overflowMaxValue: true };
    }

    return null;
  }
}

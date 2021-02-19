import {
  Directive,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Pipe,
  PipeTransform,
  SimpleChanges
} from '@angular/core';
import { NgControl } from '@angular/forms';
import BigNumber from 'bignumber.js';

@Directive({
  selector: '[appBigNumber]'
})
export class BigNumberDirective implements OnInit, OnChanges {
  private control: NgControl;
  private latestValue;
  private decimalPart;
  private oldDecimal;

  private currentDecimals: number;

  private withEndPoint;

  @Input('appBigNumber') appBigNumber;
  @Input('ngModel') ngModel;

  @Input('minValueChange') minValueChange;
  @Input('maxValueChange') maxValueChange;

  @Input('required') required;

  constructor(private injector: Injector) {
    this.control = this.injector.get(NgControl);
  }

  ngOnInit() {
    const originalWriteVal = this.control.valueAccessor.writeValue.bind(this.control.valueAccessor);
    this.control.valueAccessor.writeValue = value => originalWriteVal(this.maskValue(value));

    this.currentDecimals = !isNaN(this.appBigNumber.decimals)
      ? parseInt(this.appBigNumber.decimals, 10)
      : 0;

    if (this.minValueChange) {
      this.minValueChange.subscribe(() => {
        setTimeout(() => {
          this.control.control.setValue(this.latestValue);
        });
      });
    }

    if (this.maxValueChange) {
      this.maxValueChange.subscribe(() => {
        setTimeout(() => {
          this.control.control.setValue(this.latestValue);
        });
      });
    }

    this.control.valueChanges.subscribe((result: string) => {
      result = result || '';

      let originalValue = result.split(',').join('').replace(/\.$/, '');

      if (new BigNumber(originalValue).isNaN()) {
        originalValue = result !== '' ? this.latestValue : '';
      } else {
        const fixedResult = result.replace(/\.+$/, '.');
        this.withEndPoint = fixedResult.indexOf('.') === fixedResult.length - 1;
        this.decimalPart = originalValue ? result.split('.')[1] : '';
      }

      this.latestValue = originalValue;

      let bigNumberValue = new BigNumber(originalValue);

      const errors: any = {};

      let modelValue;

      if (!originalValue || bigNumberValue.isNaN()) {
        if (originalValue) {
          errors.pattern = true;
        } else if (this.required) {
          errors.required = true;
        }
        modelValue = '';
      } else {
        if (this.decimalPart && this.decimalPart.length > this.currentDecimals) {
          bigNumberValue = bigNumberValue.dp(this.currentDecimals);
        }

        modelValue = bigNumberValue.toString(10);

        if (bigNumberValue.div(Math.pow(2, 256) - 1).toNumber() > 1) {
          errors.totalMaximum = true;
        }

        if (bigNumberValue.minus(this.appBigNumber.min).toNumber() < 0) {
          errors.min = true;
        }

        if (bigNumberValue.minus(this.appBigNumber.max).toNumber() > 0) {
          errors.max = true;
        }
      }

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

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.appBigNumber) {
      const decimals = changes.appBigNumber.currentValue.decimals;
      this.currentDecimals = !isNaN(decimals) ? parseInt(decimals, 10) : 0;
    }
  }

  private maskValue(value) {
    const visibleValue = this.latestValue
      ? new BigNumber(this.latestValue)
      : value
      ? new BigNumber(value).div(Math.pow(10, this.currentDecimals))
      : '';

    return visibleValue
      ? visibleValue.toFormat(
          Math.min(this.decimalPart ? this.decimalPart.length : 0, this.currentDecimals || 0),
          { groupSeparator: ',', groupSize: 3, decimalSeparator: '.' }
        ) + (this.withEndPoint ? '.' : '')
      : '';
  }
}

@Pipe({ name: 'bigNumberFormat' })
export class BigNumberFormat implements PipeTransform {
  transform(value, decimals, format, asBN, round) {
    const formatNumberParams = { groupSeparator: ',', groupSize: 3, decimalSeparator: '.' };

    const bigNumberValue = new BigNumber(value).div(Math.pow(10, decimals));

    if (bigNumberValue.isNaN()) {
      return value;
    }

    if (format) {
      return round || decimals || decimals === 0
        ? bigNumberValue.dp(round || decimals).toFormat(formatNumberParams)
        : '';
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

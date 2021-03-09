import { Directive, ElementRef, Injector, Input, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Observable } from 'rxjs';
import BigNumber from 'bignumber.js';

@Directive({
  selector: '[appMinValue]'
})
export class MinMaxDirective implements OnInit {
  @Input('minValue') min: number;

  @Input('maxValue') max: number;

  @Input('checkMinValue') checkMinValue: Observable<any>;

  @Input('step') step: number;

  private oldValidValue;

  private control: any;

  constructor(private injector: Injector, private el: ElementRef) {
    this.control = this.injector.get(NgControl).control;
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.checkMinValue) {
        this.checkMinValue.subscribe(() => {
          this.validateControl();
        });
      }
      this.control.valueChanges.subscribe(() => {
        this.validateControl();
      });
      this.validateControl();
    });
  }

  private validateControl() {
    const { control } = this;
    const val = control.value * 1;
    const errors = control.errors || {};

    const olderVal = this.oldValidValue;
    if (control.value && Number.isNaN(Number(val))) {
      if (this.oldValidValue) {
        this.el.nativeElement.value = this.oldValidValue;
        setTimeout(() => {
          control.setValue(this.oldValidValue, {
            emitEvent: false
          });
        });
        return;
      }
    } else {
      this.oldValidValue = val;
    }

    const splittedStepValue = this.step.toString().split('.');
    const sizeDecimals = splittedStepValue[1] ? splittedStepValue[1].length : 0;
    const powValue = sizeDecimals ** 10;

    const stepValid = !new BigNumber(control.value)
      .times(powValue)
      .modulo(new BigNumber(this.step).times(powValue))
      .toNumber();
    const minValid = val >= this.min;
    const maxValid = this.max === undefined ? true : val <= this.max;

    if (!minValid) {
      errors.min = true;
    } else {
      delete errors.min;
    }

    if (!maxValid) {
      errors.max = true;
    } else {
      delete errors.max;
    }

    if (!stepValid) {
      errors.step = true;
      this.oldValidValue = olderVal;
      this.el.nativeElement.value = this.oldValidValue;
      control.setValue(olderVal, {
        emitEvent: false
      });
      setTimeout(() => {
        control.setValue(olderVal, {
          emitEvent: false
        });
      });
      return;
    }
    delete errors.step;

    if (JSON.stringify(errors) === '{}') {
      control.setErrors(null);
      return;
    }
    if (!Number.isNaN(Number(val))) {
      this.control.markAsTouched();
    }
    control.setErrors(errors);
  }
}

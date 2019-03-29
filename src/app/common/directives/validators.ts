// import {AbstractControl, ValidatorFn} from '@angular/forms';
// import {Directive, ElementRef, OnInit, Pipe, PipeTransform} from '@angular/core';
//
// export function minMaxValidator(minMax: {min: number, max: number}): ValidatorFn {
//   let defaultValue;
//   return (control: AbstractControl): { [key: string]: boolean } | null => {
//
//     const minValid = (minMax.min === undefined) || (control.value >= minMax.min);
//     const maxValid = (minMax.max === undefined) || (control.value <= minMax.max);
//
//     const isInValidValue = control.value && (isNaN(control.value) || !minValid || !maxValid);
//
//
//     if (isInValidValue) {
//       control.setValue(defaultValue);
//       setTimeout(() => {
//         control.setValue(defaultValue);
//       }, 500);
//       return {
//         'min-max': true
//       };
//     }
//
//     defaultValue = control.value;
//     return null;
//   };
// }
//
//
// export function regExpValidator(regExp: RegExp): ValidatorFn {
//   let defaultValue;
//   return (control: AbstractControl): { [key: string]: boolean } | null => {
//     const isInValidValue = control.value && !regExp.test(control.value);
//     if (isInValidValue) {
//       control.setValue(defaultValue);
//     }
//     defaultValue = control.value;
//     return null;
//   };
// }
//
//
// @Directive({ selector: '[appCustomNumber]' })
// export class AppCustomNumberDirective implements OnInit {
//
//   private el: HTMLInputElement;
//
//   constructor(
//     private elementRef: ElementRef
//   ) {
//     this.el = this.elementRef.nativeElement;
//   }
//
//   ngOnInit() {
//     // this.el.value = this.currencyPipe.transform(this.el.value);
//   }
//
//   // @HostListener("focus", ["$event.target.value"])
//   // onFocus(value) {
//     // this.el.value = this.currencyPipe.parse(value); // opossite of transform
//   // }
//
//   // @HostListener("blur", ["$event.target.value"])
//   // onBlur(value) {
//     // this.el.value = this.currencyPipe.transform(value);
//   // }
//
// }

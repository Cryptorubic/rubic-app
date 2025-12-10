import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BIG_NUMBER_FORMAT } from '@shared/constants/formats/big-number-format';

@Directive({
  selector: '[appTokenAmount]'
})
export class TokenAmountDirective {
  @Input() set decimals(value: number) {
    this._decimals = value;
    setTimeout(() => this.onChange());
  }

  @Output() amountChange = new EventEmitter<string>();

  private readonly amountRegex = /^([0-9]+\.?[0-9]*|[0-9]*\.?[0-9]+)?$/;

  private _decimals: number;

  private prevValue = '';

  private prevCaretPosition = 0;

  private isFocused = false;

  constructor(private readonly elementRef: ElementRef) {}

  @HostListener('ngModelChange')
  private onChange(): void {
    const nativeValue: string = this.elementRef.nativeElement.value || '';
    let value = nativeValue.replaceAll(',', '');

    let caretPosition = this.elementRef.nativeElement.selectionStart;

    if (nativeValue && nativeValue[nativeValue.length - 1] === ',') {
      value += '.';
    }
    if (value === '.') {
      if (this.prevValue === '') {
        value = '0.';
        caretPosition = 2;
      } else {
        value = '';
        caretPosition = 0;
      }
    }

    if (this.amountRegex.test(value)) {
      value = TokenAmountDirective.transformValue(value, this._decimals);
      if (value === this.prevValue) {
        caretPosition = this.prevCaretPosition;
      } else {
        caretPosition = this.getNewCaretPosition(value, caretPosition);
      }
    } else {
      value = this.prevValue;
      caretPosition = this.prevCaretPosition;
    }

    this.elementRef.nativeElement.value = value;
    if (this.isFocused) {
      this.elementRef.nativeElement.setSelectionRange(caretPosition, caretPosition);
    }
    this.amountChange.emit(value);

    this.prevValue = value;
    this.prevCaretPosition = caretPosition;
  }

  public static replaceCommas(visibleValue: string): string {
    return visibleValue.replaceAll(',', '');
  }

  public static transformValue(value: string, decimals: number): string {
    if (value.includes(',')) {
      value = this.replaceCommas(value);
    }
    if (value.includes('.')) {
      const decimalsStartIndex = value.indexOf('.') + 1;
      value = value.slice(0, decimalsStartIndex + decimals);
    }

    const [integerPart, decimalPart] = value.split('.');
    if (integerPart.length) {
      value =
        new BigNumber(integerPart).toFormat(BIG_NUMBER_FORMAT) +
        (value.includes('.') ? '.' : '') +
        (decimalPart || '');
    }

    return value;
  }

  private getNewCaretPosition(value: string, caretPosition: number): number {
    const isSymbolAdded = this.prevValue.length < value.length;
    const commasAmountBeforeCaretPosition =
      this.prevValue.substring(0, caretPosition - (isSymbolAdded ? 1 : 0)).split(',').length - 1;
    const newCommasAmountBeforeCaretPosition =
      value.substring(0, caretPosition).split(',').length - 1;

    let newCaretPosition =
      caretPosition + (newCommasAmountBeforeCaretPosition - commasAmountBeforeCaretPosition);
    if (newCaretPosition && value.length && value[newCaretPosition - 1] === ',') {
      newCaretPosition--;
    }

    return newCaretPosition;
  }

  @HostListener('keyup')
  @HostListener('click')
  private onCaretPositionChange(): void {
    this.prevCaretPosition = this.elementRef.nativeElement.selectionStart;
  }

  @HostListener('focus')
  private onFocus(): void {
    this.isFocused = true;
  }

  @HostListener('focusout')
  private onFocusOut(): void {
    this.isFocused = false;
  }
}

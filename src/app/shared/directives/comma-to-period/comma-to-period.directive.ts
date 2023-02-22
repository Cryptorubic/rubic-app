import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appCommaToPeriod]'
})
export class CommaToPeriodDirective {
  @Output() amountChange = new EventEmitter<number>();

  @Input() public readonly minAmount: number = 0.01;

  @Input() public readonly maxAmount: number = 50;

  @Input() public readonly decimals: number = 2;

  private readonly amountRegex = /^([0-9]+\.?[0-9]*|[0-9]*\.?[0-9]+)?$/;

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

    const numberAmount = Number(value);

    if (this.amountRegex.test(value)) {
      if (numberAmount >= this.maxAmount) {
        value = String(this.maxAmount);
      }

      const valueDecimated = value.split('.');
      if (valueDecimated.length > 1) {
        const decimalsLength = valueDecimated.at(-1).length;
        if (decimalsLength > this.decimals) {
          value = value.slice(0, valueDecimated.length + this.decimals);
        }
      }

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
    this.amountChange.emit(Number(value));

    this.prevValue = value;
    this.prevCaretPosition = caretPosition;
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
}

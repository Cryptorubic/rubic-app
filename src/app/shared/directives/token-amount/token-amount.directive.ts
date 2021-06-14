import { Directive, ElementRef, HostListener, Output, EventEmitter, Input } from '@angular/core';

@Directive({
  selector: '[appTokenAmount]'
})
export class TokenAmountDirective {
  @Input() decimals: number;

  @Output() amountChange = new EventEmitter<string>();

  private readonly amountRegex = /^([0-9]+\.?[0-9]*|[0-9]*\.?[0-9]+)?$/;

  private prevValue = '';

  private prevCaretPosition = 0;

  constructor(private readonly elementRef: ElementRef) {}

  @HostListener('ngModelChange')
  private onChange(): void {
    let { value } = this.elementRef.nativeElement;
    let caretPosition = this.elementRef.nativeElement.selectionStart;

    if (value.includes(',')) {
      value = value.replaceAll(',', '.');
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

    if (!this.amountRegex.test(value)) {
      value = this.prevValue;
      caretPosition = this.prevCaretPosition;
    } else if (value.includes('.')) {
      const decimalsStartIndex = value.indexOf('.') + 1;
      value = value.slice(0, decimalsStartIndex + this.decimals);
    }

    this.elementRef.nativeElement.value = value;
    this.elementRef.nativeElement.setSelectionRange(caretPosition, caretPosition);
    this.amountChange.emit(value);

    this.prevValue = value;
    this.prevCaretPosition = caretPosition;
  }

  @HostListener('keyup')
  @HostListener('click')
  private onCaretPositionChange() {
    this.prevCaretPosition = this.elementRef.nativeElement.selectionStart;
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-primary-button',
  templateUrl: './primary-button.component.html',
  styleUrls: ['./primary-button.component.scss']
})
export class PrimaryButtonComponent {
  @Input() type: string = 'submit';

  @Input() animate?: boolean = false;

  @Input() label: string;

  @Input() className?: string = '';

  @Input() disabled?: boolean = false;

  @Input() backgroundColor?: string;

  @Input() textColor?: string;

  @Input() hideArrow?: boolean;

  @Input() border?: boolean;

  @Input() borderColor?: string;

  @Output() onClick = new EventEmitter<void>();

  onClickHandler() {
    this.onClick.emit();
  }

  constructor() {
    this.hideArrow = true;
    const rubicPrimaryColor = '#4aa956';
    this.borderColor = rubicPrimaryColor;
  }
}

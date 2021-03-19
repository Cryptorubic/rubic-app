import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-withdraw-button',
  templateUrl: './withdraw-button.component.html',
  styleUrls: ['./withdraw-button.component.scss']
})
export class WithdrawButtonComponent {
  @Input() animated = false;

  @Input() disabled = false;

  @Output() onClick = new EventEmitter<void>();

  onClickHandler() {
    this.onClick.emit();
  }

  constructor() {}
}

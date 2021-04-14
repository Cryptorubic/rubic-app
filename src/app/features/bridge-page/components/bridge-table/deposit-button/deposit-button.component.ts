import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-deposit-button',
  templateUrl: './deposit-button.component.html',
  styleUrls: ['./deposit-button.component.scss']
})
export class DepositButtonComponent {
  @Input() animate = false;

  @Output() onClick = new EventEmitter<void>();

  constructor() {}
}

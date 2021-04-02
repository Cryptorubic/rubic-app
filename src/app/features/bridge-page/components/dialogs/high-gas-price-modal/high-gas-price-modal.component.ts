import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-high-gas-price-modal',
  templateUrl: './high-gas-price-modal.component.html',
  styleUrls: ['./high-gas-price-modal.component.scss']
})
export class HighGasPriceModalComponent {
  @Output() onConfirm = new EventEmitter();

  @Output() onCancel = new EventEmitter();

  constructor() {}
}

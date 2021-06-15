import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-trade-success-modal',
  templateUrl: './trade-success-modal.component.html',
  styleUrls: ['./trade-success-modal.component.scss']
})
export class TradeSuccessModalComponent {
  @Input() txId: string;

  @Output() onCloseEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  public onCloseHandler() {
    this.onCloseEvent.emit();
  }
}

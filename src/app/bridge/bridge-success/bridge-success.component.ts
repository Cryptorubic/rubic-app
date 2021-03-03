import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-bridge-success',
  templateUrl: './bridge-success.component.html',
  styleUrls: ['./bridge-success.component.scss']
})
export class BridgeSuccessComponent {
  @Input() txId: string;

  @Output() onCloseEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  public onCloseHandler() {
    this.onCloseEvent.emit();
  }
}

import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Output() onCloseEvent?: EventEmitter<void> = new EventEmitter<void>();

  public closed: boolean = false;

  constructor() {}

  public onCloseHandler() {
    this.onCloseEvent.emit();
    this.closed = true;
  }
}

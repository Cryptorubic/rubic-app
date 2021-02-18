import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Output() onCloseEvent?: EventEmitter<void> = new EventEmitter<void>();

  public closed: boolean = false;
  constructor() {}

  ngOnInit() {}

  public onCloseHandler() {
    this.onCloseEvent.emit();
    this.closed = true;
  }
}

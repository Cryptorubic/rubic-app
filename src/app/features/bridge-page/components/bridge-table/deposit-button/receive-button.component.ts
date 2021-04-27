import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-receive-button',
  templateUrl: './receive-button.component.html',
  styleUrls: ['./receive-button.component.scss']
})
export class ReceiveButtonComponent {
  @Input() animate = false;

  @Output() onClick = new EventEmitter<void>();

  constructor() {}
}

import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'warning-modal',
  templateUrl: './warning-modal.component.html',
  styleUrls: ['./warning-modal.component.scss']
})
export class WarningModalComponent {
  @Input() warningText: string;

  @Output() onConfirm = new EventEmitter();

  @Output() onCancel = new EventEmitter();

  constructor() {}
}

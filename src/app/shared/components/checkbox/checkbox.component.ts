import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  @Input() disabled = false;

  @Input() checked: boolean;

  @Output() checkedChange = new EventEmitter<boolean>();

  onChange(model: boolean) {
    this.checked = model;
    this.checkedChange.emit(model);
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-advanced-options-button',
  templateUrl: './advanced-options-button.component.html',
  styleUrls: ['./advanced-options-button.component.scss']
})
export class AdvancedOptionsButtonComponent {
  @Input() isOpened = false;

  @Output() isOpenedChange = new EventEmitter<boolean>();

  constructor() {}

  public onButtonClicked(): void {
    this.isOpened = !this.isOpened;
    this.isOpenedChange.emit(this.isOpened);
  }
}

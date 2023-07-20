import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-settings-toggler',
  templateUrl: './settings-toggler.component.html',
  styleUrls: ['./settings-toggler.component.scss']
})
export class SettingsTogglerComponent {
  @Input() public settingsOpened = false;

  @Output() public readonly changeSettingsVisibility = new EventEmitter<boolean>();

  constructor() {}
}

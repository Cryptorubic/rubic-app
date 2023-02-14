import { Component } from '@angular/core';

@Component({
  selector: 'app-settings-toggler',
  templateUrl: './settings-toggler.component.html',
  styleUrls: ['./settings-toggler.component.scss']
})
export class SettingsTogglerComponent {
  public isSettingsOpened = false;

  constructor() {}

  public backToSettings(): void {
    console.log(this.isSettingsOpened);
  }
}

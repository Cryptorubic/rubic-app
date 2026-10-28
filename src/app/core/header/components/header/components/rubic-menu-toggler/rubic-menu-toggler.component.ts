import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-rubic-menu-toggler',
  templateUrl: './rubic-menu-toggler.component.html',
  styleUrls: ['./rubic-menu-toggler.component.scss']
})
export class RubicMenuTogglerComponent {
  public isOpened = false;

  constructor() {}

  public closeMenu(): void {
    this.isOpened = false;
  }
}

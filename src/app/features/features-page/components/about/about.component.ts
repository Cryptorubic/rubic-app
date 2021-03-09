import { Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutageComponent {
  public isMobile: boolean = window.innerWidth < 800;

  constructor() {}
}

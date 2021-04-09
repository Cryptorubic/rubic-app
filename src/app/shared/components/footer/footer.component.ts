import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  private clicks: number = 0;

  constructor() {}

  public useTestingMode(): void {
    this.clicks++;
    const neededClicksAmount = 10;
    if (this.clicks === neededClicksAmount) {
      this.clicks = 0;
      (window as any).useTestingMode();
    }
  }
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-banner',
  templateUrl: './app-banner.component.html',
  styleUrls: ['./app-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent {
  @Input() href: string;

  constructor() {}
}

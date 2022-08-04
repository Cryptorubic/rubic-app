import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-referral-banner',
  templateUrl: './app-referral-banner.component.html',
  styleUrls: ['./app-referral-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppReferralBannerComponent {
  @Input() href: string;

  constructor() {}
}

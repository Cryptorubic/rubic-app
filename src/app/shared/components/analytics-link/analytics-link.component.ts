import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-analytics-link',
  templateUrl: './analytics-link.component.html',
  styleUrls: ['./analytics-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsLinkComponent {
  @Input() public tokenInfoUrl: string;

  constructor() {}
}

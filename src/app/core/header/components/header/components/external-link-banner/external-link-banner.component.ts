import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-external-link-banner',
  styleUrls: ['./external-link-banner.component.scss'],
  templateUrl: './external-link-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalLinkBannerComponent {
  @Input() href: string;

  @Input() linkColor: string | undefined;

  constructor() {}
}

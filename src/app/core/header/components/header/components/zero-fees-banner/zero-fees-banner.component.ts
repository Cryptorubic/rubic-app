import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-zero-fees-banner',
  templateUrl: './zero-fees-banner.component.html',
  styleUrls: ['./zero-fees-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZeroFeesBannerComponent {
  @Input({ required: true }) href: string;
}

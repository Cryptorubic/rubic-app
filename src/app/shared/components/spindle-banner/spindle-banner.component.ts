import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-spindle-banner',
  templateUrl: './spindle-banner.component.html',
  styleUrls: ['./spindle-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpindleBannerComponent {}

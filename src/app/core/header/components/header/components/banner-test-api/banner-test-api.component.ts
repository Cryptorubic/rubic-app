import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-banner-test-api',
  templateUrl: './banner-test-api.component.html',
  styleUrls: ['./banner-test-api.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerTestApiComponent {}

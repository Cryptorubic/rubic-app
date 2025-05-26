import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-banner-test-promo',
  templateUrl: './banner-test-promo.component.html',
  styleUrls: ['./banner-test-promo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerTestPromoComponent {}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PRICE_IMPACT_RANGE } from '@shared/models/swaps/price-impact-range';

@Component({
  selector: 'app-price-impact-info-line',
  templateUrl: './price-impact-info-line.component.html',
  styleUrls: ['./price-impact-info-line.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceImpactInfoLineComponent {
  @Input() public title = 'Price impact';

  @Input() public hint: string;

  @Input() public priceImpact: number;

  public PRICE_IMPACT_RANGE = PRICE_IMPACT_RANGE;

  constructor() {}
}

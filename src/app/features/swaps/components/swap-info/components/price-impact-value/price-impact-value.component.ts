import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PRICE_IMPACT_RANGE } from '@shared/utils/price-impact/models/PRICE_IMPACT_RANGE';

@Component({
  selector: 'app-price-impact-value',
  templateUrl: './price-impact-value.component.html',
  styleUrls: ['./price-impact-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceImpactValueComponent {
  @Input() public priceImpact: number;

  public PRICE_IMPACT_RANGE = PRICE_IMPACT_RANGE;

  constructor() {}
}

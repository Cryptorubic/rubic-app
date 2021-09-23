import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-usd-price-container',
  templateUrl: './usd-price-container.component.html',
  styleUrls: ['./usd-price-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsdPriceContainerComponent {
  @Input() public usdPrice: BigNumber;

  constructor() {}
}

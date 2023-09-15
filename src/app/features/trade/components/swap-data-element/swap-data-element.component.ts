import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-swap-data-element',
  templateUrl: './swap-data-element.component.html',
  styleUrls: ['./swap-data-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapDataElementComponent {
  @Input({ required: true }) gasFee: BigNumber;

  @Input({ required: true }) providerFee: BigNumber;

  @Input({ required: true }) time: string;
}

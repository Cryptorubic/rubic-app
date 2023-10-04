import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FeeInfo } from 'rubic-sdk';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-swap-data-element',
  templateUrl: './swap-data-element.component.html',
  styleUrls: ['./swap-data-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapDataElementComponent {
  @Input({ required: true }) feeInfo: FeeInfo | null;

  @Input({ required: true }) gasInfo: { amount: BigNumber; symbol: string } | null;

  @Input({ required: true }) time: string | number;
}

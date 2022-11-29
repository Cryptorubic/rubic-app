import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-onramper-to-amount-estimated',
  templateUrl: './onramper-to-amount-estimated.component.html',
  styleUrls: ['./onramper-to-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperToAmountEstimatedComponent {
  @Input() toAmount: BigNumber;

  @Input() errorText = '';

  constructor() {}
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FeeInfo } from 'rubic-sdk';

@Component({
  selector: 'app-rubic-fee-value',
  templateUrl: './rubic-fee-value.component.html',
  styleUrls: ['./rubic-fee-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicFeeValueComponent {
  @Input() public readonly fee: FeeInfo['rubicProxy'];
}

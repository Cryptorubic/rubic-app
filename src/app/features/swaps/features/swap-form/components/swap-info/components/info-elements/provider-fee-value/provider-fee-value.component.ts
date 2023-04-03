import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FeeInfo } from 'rubic-sdk';

@Component({
  selector: 'app-provider-fee-value',
  templateUrl: './provider-fee-value.component.html',
  styleUrls: ['./provider-fee-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderFeeValueComponent {
  @Input() public readonly fee: FeeInfo['provider'];
}

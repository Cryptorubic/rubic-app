import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FeeInfo } from 'rubic-sdk';

@Component({
  selector: 'app-swap-data-element',
  templateUrl: './swap-data-element.component.html',
  styleUrls: ['./swap-data-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapDataElementComponent {
  @Input({ required: true }) feeInfo: FeeInfo | null;

  @Input({ required: true }) time: string | number;
}

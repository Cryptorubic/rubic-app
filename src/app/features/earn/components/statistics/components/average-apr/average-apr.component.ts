import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-average-apr',
  templateUrl: './average-apr.component.html',
  styleUrls: ['./average-apr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AverageAprComponent {
  @Input({ required: true }) value: BigNumber;
}

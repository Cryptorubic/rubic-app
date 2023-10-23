import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-locked-rbc-in-percent',
  templateUrl: './locked-rbc-in-percent.component.html',
  styleUrls: ['./locked-rbc-in-percent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LockedRbcInPercentComponent {
  @Input({ required: true }) value: BigNumber;
}

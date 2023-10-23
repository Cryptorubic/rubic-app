import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-locked-rbc-in-dollars',
  templateUrl: './locked-rbc-in-dollars.component.html',
  styleUrls: ['./locked-rbc-in-dollars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LockedRbcInDollarsComponent {
  @Input({ required: true }) value: BigNumber;
}

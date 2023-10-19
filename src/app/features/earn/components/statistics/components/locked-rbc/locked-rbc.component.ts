import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-locked-rbc',
  templateUrl: './locked-rbc.component.html',
  styleUrls: ['./locked-rbc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LockedRbcComponent {
  @Input({ required: true }) value: BigNumber;
}

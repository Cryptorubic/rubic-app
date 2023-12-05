import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-reward-per-week',
  templateUrl: './reward-per-week.component.html',
  styleUrls: ['./reward-per-week.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RewardPerWeekComponent {
  @Input({ required: true }) value: BigNumber;
}

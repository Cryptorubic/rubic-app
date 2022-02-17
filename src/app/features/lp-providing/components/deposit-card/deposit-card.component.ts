import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-deposit-card',
  templateUrl: './deposit-card.component.html',
  styleUrls: ['./deposit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositCardComponent {
  @Input()
  brbcAmount: BigNumber;

  @Input()
  usdcAmount: BigNumber;

  @Input()
  collectedRewards: BigNumber;

  @Input()
  rewardsToCollect: BigNumber;

  @Input()
  period: number;

  @Input()
  id: number;

  @Input()
  start: Date;

  @Input()
  status: string;

  @Output()
  onCollectReward = new EventEmitter<void>();

  @Output()
  onRemoveDeposit = new EventEmitter<void>();

  constructor() {}
}

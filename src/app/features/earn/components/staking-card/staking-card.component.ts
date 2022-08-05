import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { StatusBadgeType } from '@app/shared/components/status-badge/status-badge.component';
import BigNumber from 'bignumber.js';
import { RoundStatus } from '../../models/round-status.enum';

const STATUS_BADGE_TYPE: Partial<Record<RoundStatus, StatusBadgeType>> = {
  [RoundStatus.ACTIVE]: 'active',
  [RoundStatus.CLOSED]: 'error',
  [RoundStatus.FULL]: 'warning'
};

const STATUS_BADGE_TEXT: Partial<Record<RoundStatus, string>> = {
  [RoundStatus.ACTIVE]: 'Active',
  [RoundStatus.CLOSED]: 'Closed',
  [RoundStatus.FULL]: 'Full'
};
@Component({
  selector: 'app-staking-card',
  templateUrl: './staking-card.component.html',
  styleUrls: ['./staking-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingCardComponent {
  @Input() round: number;

  @Input() apr: number;

  @Input() poolLimit: number;

  @Input() balance: BigNumber;

  @Input() statuses: RoundStatus[];

  @Output() readonly onNavigate = new EventEmitter<number>();

  public readonly statusBadgeType = STATUS_BADGE_TYPE;

  public readonly statusBadgeText = STATUS_BADGE_TEXT;

  public readonly roundStatus = RoundStatus;

  constructor() {}
}

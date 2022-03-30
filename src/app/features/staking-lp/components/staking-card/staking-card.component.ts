import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { RoundStatus } from '../../models/round-status.enum';

const STATUS_BADGE_TYPE = {
  [RoundStatus.ACTIVE]: 'active',
  [RoundStatus.CLOSED]: 'error',
  [RoundStatus.FULL]: 'warning'
};

const STATUS_BADGE_TEXT = {
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
export class StakingCardComponent implements OnInit {
  @Input() round: number;

  @Input() apr: number;

  @Input() poolLimit: number;

  @Input() balance: number;

  @Input() statuses: RoundStatus[];

  @Output()
  onNavigate = new EventEmitter<number>();

  public readonly statusBadgeType = STATUS_BADGE_TYPE;

  public readonly statusBadgeText = STATUS_BADGE_TEXT;

  constructor() {}

  ngOnInit(): void {
    return undefined;
  }

  public isActive(statuses: RoundStatus[]): boolean {
    return !statuses.includes(RoundStatus.CLOSED);
  }
}

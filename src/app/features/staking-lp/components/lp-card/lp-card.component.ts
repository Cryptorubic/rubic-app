import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
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
  selector: 'app-lp-card',
  templateUrl: './lp-card.component.html',
  styleUrls: ['./lp-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LpCardComponent {
  @Input() round: number;

  @Input() apr: number;

  @Input() poolLimit: number;

  @Input() balance: number;

  @Input() startTime: string;

  @Input() statuses: RoundStatus[];

  @Output() onNavigate = new EventEmitter<number>();

  public readonly statusBadgeType = STATUS_BADGE_TYPE;

  public readonly statusBadgeText = STATUS_BADGE_TEXT;

  public readonly roundStatus = RoundStatus;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(private readonly headerStore: HeaderStore) {}

  public isInPast(date: string): boolean {
    const start = new Date(date);
    const now = new Date();

    return now < start;
  }
}

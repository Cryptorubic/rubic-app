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

  @Input() start: Date;

  @Input() statuses: RoundStatus[] = [RoundStatus.CLOSED];

  @Input() isStarted: boolean;

  @Output() readonly onNavigate = new EventEmitter<number>();

  public readonly statusBadgeType = STATUS_BADGE_TYPE;

  public readonly statusBadgeText = STATUS_BADGE_TEXT;

  public readonly roundStatus = RoundStatus;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(private readonly headerStore: HeaderStore) {}

  public isInPast(start: Date): boolean {
    const now = new Date();

    return now < start;
  }

  public getButtonText(statuses: RoundStatus[]): string {
    if (statuses && statuses.includes(this.roundStatus.CLOSED)) {
      return 'Check';
    }

    if (this.balance > 0) {
      return 'Details';
    } else {
      return 'Join Round';
    }
  }
}

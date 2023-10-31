import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type BadgeStatus = 'error' | 'info' | 'success' | 'warning';

@Component({
  selector: 'app-rubic-badge',
  templateUrl: './rubic-badge.component.html',
  styleUrls: ['./rubic-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicBadgeComponent {
  @Input({ required: true }) status: BadgeStatus;

  @Input({ required: true }) label: string;
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type StatusBadgeType = 'warning' | 'error' | 'active' | 'info' | 'inactive';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  @Input() type: StatusBadgeType;

  @Input() text: string;
}

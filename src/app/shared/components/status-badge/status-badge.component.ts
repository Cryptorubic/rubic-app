import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  @Input() type: string;

  @Input() text: string;

  @Input() cursor: 'pointer' | 'default' = 'default';
}

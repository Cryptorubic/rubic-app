import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TuiSizeL, TuiSizeS } from '@taiga-ui/core';

@Component({
  selector: 'app-notification-badge',
  templateUrl: './notification-badge.component.html',
  styleUrls: ['./notification-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationBadgeComponent {
  @Input() value: number | string;

  @Input() size: TuiSizeS | TuiSizeL;

  constructor() {}
}

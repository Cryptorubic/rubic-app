import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TuiSizeL, TuiSizeS, TuiSizeXS } from '@taiga-ui/core';

/**
 * Display count of notifications.
 */
@Component({
  selector: 'app-notification-badge',
  templateUrl: './notification-badge.component.html',
  styleUrls: ['./notification-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationBadgeComponent {
  /**
   * Count of notifications.
   */
  @Input() value: number | string;

  /**
   * Size of the notification component.
   */
  @Input() size: TuiSizeS | TuiSizeL | TuiSizeXS;

  /**
   * Background color of notification component
   */
  @Input() color: 'red' | 'green';

  constructor() {}
}

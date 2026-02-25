import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PrivateActivityItem } from '../../models/activity-item';

@Component({
  selector: 'app-last-private-activity-element',
  templateUrl: './last-private-activity-element.component.html',
  styleUrls: ['./last-private-activity-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LastPrivateActivityElementComponent {
  @Input({ required: true }) activityItem: PrivateActivityItem;

  @Output() openClicked = new EventEmitter();
}

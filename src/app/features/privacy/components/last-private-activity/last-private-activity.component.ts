import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PrivateActivityItem } from '../../models/activity-item';

@Component({
  selector: 'app-last-private-activity',
  templateUrl: './last-private-activity.component.html',
  styleUrls: ['./last-private-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LastPrivateActivityComponent {
  @Input() activityList: PrivateActivityItem[] = [];

  @Output() itemClicked = new EventEmitter<PrivateActivityItem>();

  public handleItemClicked(item: PrivateActivityItem): void {
    this.itemClicked.emit(item);
  }
}

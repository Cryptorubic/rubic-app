import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PrivateActivityItem } from '../../models/activity-item';
import { HeaderStore } from '@app/core/header/services/header.store';

@Component({
  selector: 'app-last-private-activity-element',
  templateUrl: './last-private-activity-element.component.html',
  styleUrls: ['./last-private-activity-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LastPrivateActivityElementComponent {
  @Input({ required: true }) activityItem: PrivateActivityItem;

  @Output() openClicked = new EventEmitter();

  public readonly isMobile = this.headerStore.isMobile;

  constructor(private readonly headerStore: HeaderStore) {}
}

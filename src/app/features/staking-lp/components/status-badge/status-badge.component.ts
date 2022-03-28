import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { STATUS } from '../../models/card-status.enum';

const STATUS_CLASS = {
  [STATUS.ACTIVE]: '1',
  [STATUS.CLOSED]: '2',
  [STATUS.FULL]: '3'
};

const STATUS_TRANSLATION_KEY = {
  [STATUS.ACTIVE]: '123',
  [STATUS.CLOSED]: '123132',
  [STATUS.FULL]: '123123'
};

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  @Input() status: STATUS;

  public readonly getClass = (status: STATUS): string => {
    return STATUS_CLASS[status];
  };

  public readonly getLabel = (status: STATUS): string => {
    return STATUS_TRANSLATION_KEY[status];
  };
}

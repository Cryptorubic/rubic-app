import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WeekInfo } from '@features/testnet-promo/interfaces/week-info';

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionButtonsComponent {
  @Input({ required: true }) readonly weekInfo: WeekInfo;
}

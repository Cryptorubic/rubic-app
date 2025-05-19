import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WeekInfo } from '@features/testnet-promo/interfaces/api-models';

@Component({
  selector: 'app-total-rbc',
  templateUrl: './total-rbc.component.html',
  styleUrls: ['./total-rbc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TotalRbcComponent {
  @Input({ required: true }) public readonly weekInfo: WeekInfo;
}

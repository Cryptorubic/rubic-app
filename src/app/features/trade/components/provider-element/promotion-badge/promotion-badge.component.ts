import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BadgeInfo } from '@app/features/trade/models/trade-state';

@Component({
  selector: 'app-promotion-badge',
  templateUrl: './promotion-badge.component.html',
  styleUrls: ['./promotion-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionBadgeComponent {
  @Input() data: BadgeInfo;
}

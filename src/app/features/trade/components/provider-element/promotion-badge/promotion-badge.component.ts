import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BadgeInfoForComponent } from '@app/features/trade/models/trade-state';

@Component({
  selector: 'app-promotion-badge',
  templateUrl: './promotion-badge.component.html',
  styleUrls: ['./promotion-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionBadgeComponent {
  @Input() data: BadgeInfoForComponent;

  @Input({ required: true }) hideHint: boolean;
}

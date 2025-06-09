import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PrizePool } from '@features/testnet-promo/interfaces/api-models';

@Component({
  selector: 'app-promo-info',
  templateUrl: './promo-info.component.html',
  styleUrls: ['./promo-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromoInfoComponent {
  @Input({ required: true }) readonly prizePool: PrizePool | null = null;
}

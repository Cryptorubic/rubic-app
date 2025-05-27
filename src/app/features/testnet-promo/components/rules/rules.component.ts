import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PrizePool } from '@features/testnet-promo/interfaces/api-models';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesComponent {
  @Input({ required: true }) prizePool: PrizePool;
}

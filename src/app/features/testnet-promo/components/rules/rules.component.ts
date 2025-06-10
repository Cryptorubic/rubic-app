import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PrizePool } from '@features/testnet-promo/interfaces/api-models';
import { TestnetPromoStateService } from '@features/testnet-promo/services/testnet-promo-state.service';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesComponent {
  @Input({ required: true }) prizePool: PrizePool;

  public readonly tokensPerWeek = this.stateService.tokensPerWeek;

  public readonly tokensPerAction = this.stateService.tokensPerAction;

  constructor(private readonly stateService: TestnetPromoStateService) {}
}

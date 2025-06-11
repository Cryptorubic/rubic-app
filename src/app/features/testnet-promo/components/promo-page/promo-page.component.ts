import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TestnetPromoStateService } from '@features/testnet-promo/services/testnet-promo-state.service';

@Component({
  selector: 'app-berachella-page',
  templateUrl: './promo-page.component.html',
  styleUrls: ['./promo-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PromoPageComponent {
  public readonly pageState$ = this.stateService.pageState$;

  public readonly prizePool$ = this.stateService.prizePool$;

  public readonly proofs$ = this.stateService.userProofs$;

  public readonly weekInfo$ = this.stateService.weekInfo$;

  constructor(private readonly stateService: TestnetPromoStateService) {}
}

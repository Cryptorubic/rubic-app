import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TestnetPromoService } from '@features/testnet-promo/testnet-promo.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-promo-page',
  templateUrl: './promo-page.component.html',
  styleUrls: ['./promo-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PromoPageComponent {
  public readonly pageState$ = this.pageService.pageState$.pipe(tap(el => console.log('!!!', el)));

  public readonly prizePool$ = this.pageService.prizePool$;

  public readonly proofs$ = this.pageService.userProofs$;

  public readonly weekInfo$ = this.pageService.weekInfo$;

  constructor(private readonly pageService: TestnetPromoService) {}
}

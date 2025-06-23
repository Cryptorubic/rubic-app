import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UserProofs } from '@features/testnet-promo/interfaces/api-models';

@Component({
  selector: 'app-promo-claim',
  templateUrl: './promo-claim.component.html',
  styleUrls: ['./promo-claim.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromoClaimComponent {
  @Input({ required: true }) public readonly proofs: UserProofs;
}

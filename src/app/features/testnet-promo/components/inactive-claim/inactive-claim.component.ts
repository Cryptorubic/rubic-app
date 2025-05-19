import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProofInfo } from '@features/testnet-promo/interfaces/api-models';

@Component({
  selector: 'app-inactive-claim',
  templateUrl: './inactive-claim.component.html',
  styleUrls: ['./inactive-claim.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InactiveClaimComponent {
  @Input({ required: true }) round: ProofInfo;
}

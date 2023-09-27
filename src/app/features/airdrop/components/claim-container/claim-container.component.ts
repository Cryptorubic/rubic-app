import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClaimService } from '@shared/services/token-distribution-services/claim.services';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { AirdropService } from '@features/airdrop/services/airdrop.service';

@Component({
  selector: 'app-claim-container',
  templateUrl: './claim-container.component.html',
  styleUrls: ['./claim-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimContainerComponent {
  public readonly rounds$ = this.airdropService.rounds$;

  constructor(
    private readonly airdropService: AirdropService,
    private readonly claimService: ClaimService
  ) {}

  public handleClaim(claimData: ClaimTokensData): void {
    this.claimService.claimTokens(claimData);
  }
}

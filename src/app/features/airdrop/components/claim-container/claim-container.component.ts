import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClaimService } from '@shared/services/token-distribution-services/claim.services';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { AirdropService } from '@features/airdrop/services/airdrop.service';
import { ClaimRound } from '@shared/models/claim/claim-round';

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

  public trackByRoundNumber(_index: number, round: ClaimRound): number {
    return round.roundNumber;
  }

  public handleClaim(roundData: { claimData: ClaimTokensData; claimRound: number }): void {
    this.claimService.claimTokens(roundData.claimData, () =>
      this.airdropService.updateRound(roundData.claimRound)
    );
  }
}

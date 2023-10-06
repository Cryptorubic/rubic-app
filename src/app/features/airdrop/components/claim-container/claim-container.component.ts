import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NumberedClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { AirdropService } from '@features/airdrop/services/airdrop.service';

@Component({
  selector: 'app-claim-container',
  templateUrl: './claim-container.component.html',
  styleUrls: ['./claim-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimContainerComponent {
  public readonly rounds$ = this.airdropService.rounds$;

  constructor(private readonly airdropService: AirdropService) {}

  public trackByRoundNumber(_index: number, round: ClaimRound): number {
    return round.roundNumber;
  }

  public handleClaim(roundData: NumberedClaimTokensData): void {
    this.airdropService.claimTokens(roundData.claimData, roundData.claimRound);
  }
}

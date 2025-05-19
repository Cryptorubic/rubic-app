import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProofInfo, UserProofs } from '@features/testnet-promo/interfaces/api-models';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { BehaviorSubject } from 'rxjs';
import BigNumber from 'bignumber.js';
import { BigNumber as BN } from 'ethers';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

@Component({
  selector: 'app-promo-claim',
  templateUrl: './promo-claim.component.html',
  styleUrls: ['./promo-claim.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromoClaimComponent {
  private readonly _claimLoading$ = new BehaviorSubject<boolean>(false);

  public readonly claimLoading$ = this._claimLoading$.asObservable();

  @Input({ required: true }) public readonly proofs: UserProofs;

  //   {
  //   if (!proofs) {
  //     this.rounds = [];
  //     return;
  //   }
  //   const activeRound = this.transformProofToRound(proofs.activeRound, true);
  //   const finishedRounds = proofs.completed.map(el => this.transformProofToRound(el, false));
  //   this.rounds = [activeRound, ...finishedRounds];
  // }

  public handleClaim(el: unknown): void {
    console.log(el);
  }

  public trackByRoundNumber(_index: number, round: ClaimRound): number {
    return round.roundNumber;
  }

  private transformProofToRound(proof: ProofInfo, active: boolean): ClaimRound {
    return {
      roundNumber: proof.week,
      claimDate: '???',
      status: active ? 'active' : 'expired',
      claimName: 'testnet-promo',
      isParticipantOfCurrentRound: true,
      claimAmount: new BigNumber(proof.amount),
      claimData: {
        contractAddress: proof.contractAddress,
        node: {
          index: proof.index,
          account: proof.contractAddress,
          amount: BN.from('1')
        },
        proof: proof.proof
      },
      network: BLOCKCHAIN_NAME.ARBITRUM
    };
  }
}

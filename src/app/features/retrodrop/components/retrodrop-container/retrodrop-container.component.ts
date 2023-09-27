import { ChangeDetectionStrategy, Component } from '@angular/core';
import BigNumber from 'bignumber.js';
import { AirdropStateService } from '@features/airdrop/services/airdrop-state.service';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { AirdropApiService } from '@features/airdrop/services/airdrop-api.service';
import { AuthService } from '@core/services/auth/auth.service';
import { retrodropContractAddress } from '@features/retrodrop/constants/retrodrop-contract-address';
import { AirdropWeb3Service } from '@features/airdrop/services/airdrop-web3.service';
import { retrodropRounds } from '@features/retrodrop/constants/retrodrop-rounds';

export interface Round {
  roundNumber: number;
  claimData: string;
  isClosed: boolean;
  isAlreadyClaimed: boolean;
}

@Component({
  selector: 'app-retrodrop-container',
  templateUrl: './retrodrop-container.component.html',
  styleUrls: ['./retrodrop-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetrodropContainerComponent {
  public readonly isAlreadyClaimedRounds$ =
    this.swapAndEarnStateService.isRetrodropRoundsAlreadyClaimed$;

  public readonly rounds$: Observable<Round[]> = this.authService.currentUser$.pipe(
    switchMap(userAddress =>
      userAddress ? this.swapAndEarnApiService.fetchRetrodropUserInfo() : of([])
    ),
    switchMap(claimsInfo => {
      return forkJoin(
        claimsInfo.map(async claim => {
          try {
            await this.web3Service.checkClaimed(
              retrodropContractAddress[claim.round - 1],
              claim.index
            );
            const searchedRound = retrodropRounds.find(round => round.roundNumber === claim.round);
            return { ...searchedRound, isAlreadyClaimed: false };
          } catch {
            const searchedRound = retrodropRounds.find(round => round.roundNumber === claim.round);
            return { ...searchedRound, isAlreadyClaimed: true };
          }
        })
      );
    })
  );

  constructor(
    private readonly swapAndEarnStateService: AirdropStateService,
    private readonly swapAndEarnApiService: AirdropApiService,
    private readonly authService: AuthService,
    private readonly web3Service: AirdropWeb3Service
  ) {}

  public isNotParticipant(round: number): boolean {
    return (
      !this.swapAndEarnStateService.retrodropUserInfo?.[round - 1].is_participant && round <= 2
    );
  }

  public getClaimAmount(round: number): BigNumber {
    const amount = this.swapAndEarnStateService.retrodropClaimedAmounts[round - 1]?.amount;
    return amount?.gt(0) ? amount : new BigNumber(0);
  }
}

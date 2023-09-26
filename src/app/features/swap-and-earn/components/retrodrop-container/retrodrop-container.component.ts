import { ChangeDetectionStrategy, Component } from '@angular/core';
import BigNumber from 'bignumber.js';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { SwapAndEarnApiService } from '@features/swap-and-earn/services/swap-and-earn-api.service';
import { AuthService } from '@core/services/auth/auth.service';
import { retrodropContractAddress } from '@features/swap-and-earn/constants/retrodrop/retrodrop-contract-address';
import { SwapAndEarnWeb3Service } from '@features/swap-and-earn/services/swap-and-earn-web3.service';
import { rounds } from '@features/swap-and-earn/constants/retrodrop/rounds';

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
        claimsInfo.map(claim => {
          return this.web3Service
            .checkClaimed(retrodropContractAddress, claim.index)
            .then(() => {
              const searchedRound = rounds.find(round => round.roundNumber === claim.round);
              return { ...searchedRound, isAlreadyClaimed: false };
            })
            .catch(() => {
              const searchedRound = rounds.find(round => round.roundNumber === claim.round);
              return { ...searchedRound, isAlreadyClaimed: true };
            });
        })
      );
    })
  );

  constructor(
    private readonly swapAndEarnStateService: SwapAndEarnStateService,
    private readonly swapAndEarnApiService: SwapAndEarnApiService,
    private readonly authService: AuthService,
    private readonly web3Service: SwapAndEarnWeb3Service
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

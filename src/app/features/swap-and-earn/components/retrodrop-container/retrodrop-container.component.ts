import { ChangeDetectionStrategy, Component } from '@angular/core';
import BigNumber from 'bignumber.js';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Round {
  roundNumber: number;
  claimData: string;
  isClosed: boolean;
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

  public readonly rounds: Round[] = [
    {
      roundNumber: 1,
      claimData: '24.08.2023 - 24.02.2024',
      isClosed: false
    },
    {
      roundNumber: 2,
      claimData: '26.09.2023 - 26.03.2024',
      isClosed: false
    },
    {
      roundNumber: 3,
      claimData: '24.10.2023 - 24.04.2024',
      isClosed: true
    },
    {
      roundNumber: 4,
      claimData: '24.11.2023 - 24.05.2024',
      isClosed: true
    },
    {
      roundNumber: 5,
      claimData: '24.12.2023 - 24.06.2024',
      isClosed: true
    },
    {
      roundNumber: 6,
      claimData: '24.01.2024 - 24.07.2024',
      isClosed: true
    },
    {
      roundNumber: 7,
      claimData: '24.02.2024 - 24.08.2024',
      isClosed: true
    },
    {
      roundNumber: 8,
      claimData: '24.03.2024 - 24.09.2024',
      isClosed: true
    },
    {
      roundNumber: 9,
      claimData: '24.04.2024 - 24.10.2024',
      isClosed: true
    },
    {
      roundNumber: 10,
      claimData: '24.05.2024 - 24.11.2024',
      isClosed: true
    },
    {
      roundNumber: 11,
      claimData: '24.06.2024 - 24.12.2024',
      isClosed: true
    },
    {
      roundNumber: 12,
      claimData: '24.07.2024 - 24.01.2025',
      isClosed: true
    }
  ];

  constructor(private readonly swapAndEarnStateService: SwapAndEarnStateService) {}

  public isCurrentRoundAlreadyClaimed(round: number): Observable<boolean> {
    return this.isAlreadyClaimedRounds$.pipe(
      map(rounds => {
        if (rounds.length > 0) {
          return rounds[round - 1]?.isClaimed;
        }

        return true;
      })
    );
  }

  public isNotParticipant(round: number): boolean {
    return !this.swapAndEarnStateService.retrodropUserInfo?.[round - 1].is_participant;
  }

  public getClaimAmount(round: number): BigNumber {
    const amount = this.swapAndEarnStateService.retrodropClaimedAmounts[round - 1]?.amount;
    return amount?.gt(0) ? amount : new BigNumber(0);
  }
}

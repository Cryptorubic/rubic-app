import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';

interface Round {
  roundNumber: number;
  claimData: string;
  isClosed: boolean;
}

@Component({
  selector: 'app-claim-container',
  templateUrl: './claim-container.component.html',
  styleUrls: ['./claim-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimContainerComponent {
  public readonly isAlreadyClaimed$ = this.swapAndEarnStateService.isAirdropRoundAlreadyClaimed$;

  public readonly claimedAmount$ = this.swapAndEarnStateService.airdropClaimedTokens$;

  public readonly rounds: Round[] = [
    {
      roundNumber: 1,
      claimData: '05.04.2023 - 19.04.2023',
      isClosed: true
    },
    {
      roundNumber: 2,
      claimData: '05.04.2023 - 02.05.2023',
      isClosed: true
    },
    {
      roundNumber: 3,
      claimData: '05.04.2023 - 17.05.2023',
      isClosed: true
    },
    {
      roundNumber: 4,
      claimData: '05.04.2023 - 31.05.2023',
      isClosed: true
    },
    {
      roundNumber: 5,
      claimData: '05.04.2023 - 09.06.2023',
      isClosed: true
    },
    {
      roundNumber: 6,
      claimData: '05.04.2023 - 06.07.2023',
      isClosed: true
    },
    {
      roundNumber: 7,
      claimData: '05.04.2023 - 20.07.2023',
      isClosed: true
    },
    {
      roundNumber: 8,
      claimData: '05.04.2023 - 03.08.2023',
      isClosed: true
    },
    {
      roundNumber: 9,
      claimData: '05.04.2023 - 24.08.2023',
      isClosed: false
    }
  ];

  constructor(private readonly swapAndEarnStateService: SwapAndEarnStateService) {}
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';

interface Round {
  roundNumber: number;
  claimData: string;
  isClosed: boolean;
  isAlreadyClaimed?: boolean;
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
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 2,
      claimData: '05.04.2023 - 02.05.2023',
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 3,
      claimData: '05.04.2023 - 17.05.2023',
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 4,
      claimData: '05.04.2023 - 31.05.2023',
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 5,
      claimData: '05.04.2023 - 09.06.2023',
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 6,
      claimData: '05.04.2023 - 06.07.2023',
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 7,
      claimData: '05.04.2023 - 20.07.2023',
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 8,
      claimData: '05.04.2023 - 03.08.2023',
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 9,
      claimData: '05.04.2023 - 24.08.2023',
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 10,
      claimData: '05.04.2023 - 14.09.2023',
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 11,
      claimData: '05.04.2023 - 28.09.2023',
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 12,
      claimData: '05.04.2023 - 12.10.2023',
      isClosed: true,
      isAlreadyClaimed: true
    },
    {
      roundNumber: 13,
      claimData: '05.04.2023 - 01.11.2023',
      isClosed: false
    }
  ];

  constructor(private readonly swapAndEarnStateService: SwapAndEarnStateService) {}
}

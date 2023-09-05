import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';

@Component({
  selector: 'app-claim-container',
  templateUrl: './claim-container.component.html',
  styleUrls: ['./claim-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimContainerComponent {
  public readonly isAlreadyClaimed$ = this.swapAndEarnStateService.isAirdropRoundAlreadyClaimed$;

  public readonly claimedAmount$ = this.swapAndEarnStateService.airdropClaimedTokens$;

  constructor(private readonly swapAndEarnStateService: SwapAndEarnStateService) {}
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import BigNumber from 'bignumber.js';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-retrodrop-container',
  templateUrl: './retrodrop-container.component.html',
  styleUrls: ['./retrodrop-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetrodropContainerComponent {
  public readonly isAlreadyClaimedRounds$ =
    this.swapAndEarnStateService.isRetrodropRoundsAlreadyClaimed$;

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

  public getClaimAmount(round: number): BigNumber {
    const amount = this.swapAndEarnStateService.retrodropClaimedAmounts[round - 1]?.amount;
    return amount.gt(0) ? amount : new BigNumber(0);
  }
}

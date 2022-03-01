import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { StakingService } from '@features/staking/services/staking.service';
import { of } from 'rxjs';

/**
 * Component shows staking statstics for user, those are
 * APR, amount with rewards, earned rewards, xBRBC balance.
 */
@Component({
  selector: 'app-staking-statistics',
  templateUrl: './staking-statistics.component.html',
  styleUrls: ['./staking-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingStatisticsComponent {
  public readonly loading$ = this.stakingService.stakingStatisticsLoading$;

  public readonly stakingTokenBalance$ = this.stakingService.stakingTokenBalance$;

  public readonly apr$ =
    this.stakingService.stakingRound === 1
      ? this.stakingService.apr$.pipe(map(apr => `${apr.toFixed()}%`))
      : of(`30%`);

  public readonly amountWithRewards$ = this.stakingService.amountWithRewards$;

  public readonly earnedRewards$ = this.stakingService.earnedRewards$;

  public readonly stakingRound = this.stakingService.stakingRound;

  constructor(private readonly stakingService: StakingService) {}

  public reloadStakingStatistics(): void {
    this.stakingService.reloadStakingStatistics().subscribe();
  }
}

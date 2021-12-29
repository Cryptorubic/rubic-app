import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { StakingService } from '@features/staking/services/staking.service';

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

  public readonly apr$ = this.stakingService.apr$.pipe(map(apr => `${apr.toFixed()}%`));

  public readonly amountWithRewards$ = this.stakingService.amountWithRewards$;

  public readonly earnedRewards$ = this.stakingService.earnedRewards$;

  constructor(private readonly stakingService: StakingService) {}

  public reloadStakingStatistics(): void {
    this.stakingService.reloadStakingStatistics().subscribe();
  }
}

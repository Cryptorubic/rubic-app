import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StakingService } from '@features/staking/services/staking.service';

import { BRBC_TOTAL } from '@features/staking/constants/BRBC_TOTAL';
import { STAKE_LIMIT_MAX } from '@features/staking/constants/STACKING_LIMITS';

@Component({
  selector: 'app-staking-info',
  templateUrl: './staking-info.component.html',
  styleUrls: ['./staking-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingInfoComponent {
  public readonly BRBCTotal = BRBC_TOTAL;

  public readonly stakeLimitMax = STAKE_LIMIT_MAX;

  public readonly userEnteredAmount$ = this.stakingService.userEnteredAmount$;

  public readonly totalRBCEntered$ = this.stakingService.totalRBCEntered$;

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly loading$ = this.stakingService.dataReloading$;

  constructor(private readonly stakingService: StakingService) {}

  public reloadStakingProgress(): void {
    alert('will be implemented');
  }
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { StakingService } from '@features/staking/services/staking.service';

import { BRBC_TOTAL } from '@features/staking/constants/BRBC_TOTAL';
import { STAKE_LIMIT_MAX } from '@features/staking/constants/STACKING_LIMITS';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-staking-info',
  templateUrl: './staking-info.component.html',
  styleUrls: ['./staking-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingInfoComponent implements OnInit {
  public readonly BRBCTotal = BRBC_TOTAL;

  public readonly stakeLimitMax = STAKE_LIMIT_MAX;

  public readonly userEnteredAmount$ = this.stakingService.userEnteredAmount$;

  public readonly totalRBCEntered$ = this.stakingService.totalRBCEntered$;

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly loading$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly stakingService: StakingService) {}

  public ngOnInit(): void {
    this.stakingService.loadTotalRbcEntered();
    this.stakingService.loadUserEnteredAmount();
  }

  public reloadStakingProgress(): void {
    this.loading$.next(true);
    this.stakingService.reloadStakingProgress().subscribe(() => this.loading$.next(false));
  }
}

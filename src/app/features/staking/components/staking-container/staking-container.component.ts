import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { StakingService } from '@features/staking/services/staking.service';

enum STAKING_NAV_ENUM {
  STAKE = 0,
  WITHDRAW = 1
}

@Component({
  selector: 'app-staking-container',
  templateUrl: './staking-container.component.html',
  styleUrls: ['./staking-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingContainerComponent {
  public activeItemIndex = STAKING_NAV_ENUM.STAKE;

  public readonly refillTime$ = this.stakingService.refillTime$;

  constructor(
    private readonly router: Router,
    private readonly queryParamsService: QueryParamsService,
    private readonly stakingService: StakingService
  ) {}

  public navigateToSwaps(): void {
    this.router.navigate(['/']);
  }
}

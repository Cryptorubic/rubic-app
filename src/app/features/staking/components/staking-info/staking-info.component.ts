import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StakingService } from '@features/staking/services/staking.service';
import { STAKE_LIMIT_MAX } from '@app/features/staking/constants/STAKING_LIMITS';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { ThemeService } from '@core/services/theme/theme.service';

/**
 * Component shows total staking progress and progress for logged-in user.
 */
@Component({
  selector: 'app-staking-info',
  templateUrl: './staking-info.component.html',
  styleUrls: ['./staking-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingInfoComponent {
  public readonly BRBCTotal = 7000000;

  public readonly stakeLimitMax = STAKE_LIMIT_MAX[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly stakingProgress$ = this.stakingService.stakingProgress$;

  public readonly loading$ = this.stakingService.stakingProgressLoading$;

  public readonly isDark$: Observable<boolean>;

  public readonly isFirstStakingRound = this.stakingService.stakingRound === 1;

  constructor(
    private readonly stakingService: StakingService,
    private readonly themeService: ThemeService
  ) {
    this.isDark$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));
  }

  public reloadStakingProgress(): void {
    this.stakingService.reloadStakingProgress().subscribe();
  }
}

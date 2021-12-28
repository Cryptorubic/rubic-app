import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { StakingService } from '@features/staking/services/staking.service';
import { ThemeService } from '@core/services/theme/theme.service';

import { BRBC_TOTAL } from '@features/staking/constants/BRBC_TOTAL';
import { STAKE_LIMIT_MAX } from '@features/staking/constants/STACKING_LIMITS';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-staking-info',
  templateUrl: './staking-info.component.html',
  styleUrls: ['./staking-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingInfoComponent {
  public readonly BRBCTotal = BRBC_TOTAL;

  public readonly stakeLimitMax = STAKE_LIMIT_MAX[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly stakingProgress$ = this.stakingService.stakingProgress$;

  public readonly loading$ = this.stakingService.stakingProgressLoading$;

  public readonly isDark$: Observable<boolean>;

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

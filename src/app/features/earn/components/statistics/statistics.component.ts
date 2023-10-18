import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { StatisticsService } from '../../services/statistics.service';
import { HeaderStore } from '@core/header/services/header.store';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BehaviorSubject, skip } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { StakingService } from '@features/earn/services/staking.service';
import { Router } from '@angular/router';
import { WINDOW } from '@ng-web-apis/common';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsComponent implements OnInit {
  public readonly deposits$ = this.stakingService.deposits$;

  public readonly depositsLoading$ = this.stakingService.depositsLoading$;

  public readonly lockedRBC$ = this.statisticsService.lockedRBC$;

  public readonly lockedRBCInDollars$ = this.statisticsService.lockedRBCInDollars$;

  public readonly circRBCLocked$ = this.statisticsService.circRBCLocked$;

  public readonly rewardPerWeek$ = this.statisticsService.rewardPerWeek$;

  public readonly apr$ = this.statisticsService.apr$;

  private readonly _currentTimestamp$ = new BehaviorSubject<number>(Date.now());

  public loading = false;

  public readonly isMobile = this.headerStore.isMobile;

  public readonly currentUser$ = this.authService.currentUser$;

  constructor(
    private readonly authService: AuthService,
    private readonly statisticsService: StatisticsService,
    private readonly stakingService: StakingService,
    private readonly cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly router: Router,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  ngOnInit(): void {
    this.getStatisticsData();

    this.walletConnectorService.addressChange$.pipe(skip(1)).subscribe(() => {
      this.refreshStatistics();
    });
  }

  public refreshStatistics(): void {
    this.loading = true;
    this._currentTimestamp$.next(Date.now());
    this.statisticsService.updateStatistics();
    this.getStatisticsData();
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  private getStatisticsData(): void {
    this.statisticsService.getLockedRBC();
    this.statisticsService.getRewardPerWeek();
    this.statisticsService.getTotalSupply();
  }

  public async navigateToCcrForm(): Promise<void> {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/'], {
        queryParams: {
          from: 'RBC',
          to: 'RBC',
          fromChain: 'ETH',
          toChain: 'ARBITRUM',
          amount: 50000
        }
      })
    );

    this.window.open(url, '_blank');
  }

  public navigateToStakeForm(): void {
    this.router.navigate(['staking', 'new-position']);
  }
}

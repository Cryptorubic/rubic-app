import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StatisticsService } from '../../services/statistics.service';
import { HeaderStore } from '@core/header/services/header.store';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BehaviorSubject, skip } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsComponent implements OnInit {
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
    private readonly cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService
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
}

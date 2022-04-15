import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { BehaviorSubject, combineLatest, EMPTY, of } from 'rxjs';
import { filter, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { TtvFilters } from '../../models/ttv-filters.enum';
import { StakingLpService } from '../../services/staking-lp.service';

const TTV_FILTERS_TEXT = {
  [TtvFilters.ALL_TIME]: 'All Time',
  [TtvFilters.ONE_DAY]: '24 Hours',
  [TtvFilters.ONE_MONTH]: '1 Month',
  [TtvFilters.SIX_MONTH]: '6 Month'
};

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StatisticsComponent implements OnInit {
  public readonly stakingBalance$ = this.stakingLpService.stakingBalance$;

  public readonly lpBalance$ = this.stakingLpService.lpBalance$;

  public readonly totalBalanceInUsdc$ = this.stakingLpService.totalBalanceInUsdc$;

  public readonly stakingRewards$ = this.stakingLpService.stakingRewards$;

  public readonly lpRewards$ = this.stakingLpService.lpRewards$;

  public readonly totalRewardsInUsdc$ = this.stakingLpService.totalRewardsInUsdc$;

  public readonly tvlStaking$ = this.stakingLpService.tvlStaking$;

  public readonly tvlMultichain$ = this.stakingLpService.tvlMultichain$;

  public readonly tvlTotal$ = this.stakingLpService.tvlTotal$;

  public readonly balanceAndRewardsLoading$ = this.stakingLpService.balanceAndRewardsLoading$;

  public readonly tvlAndTtvLoading$ = this.stakingLpService.tvlAndTtvLoading$;

  private readonly _selectedTtvFilter$ = new BehaviorSubject<TtvFilters>(TtvFilters.ALL_TIME);

  public readonly selectedTtvFilter$ = this._selectedTtvFilter$.asObservable();

  public readonly ttv$ = combineLatest([this.selectedTtvFilter$, this.stakingLpService.ttv$]).pipe(
    filter(([_, ttv]) => Boolean(ttv)),
    map(([period]) => {
      return this.stakingLpService.getTtvByPeriod(period);
    })
  );

  public readonly ttvFiltersText = TTV_FILTERS_TEXT;

  public readonly ttvFilters = Object.values(TtvFilters);

  public balanceHintShown = false;

  public rewardsHintShow = false;

  public ttvFiltersOpen = false;

  constructor(
    private readonly stakingLpService: StakingLpService,
    private readonly cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        startWith(undefined),
        switchMap(address => {
          if (address === null) {
            this.stakingLpService.resetTotalBalanceAndRewards();
            return EMPTY;
          } else {
            return of(null);
          }
        }),
        switchMap(() => this.stakingLpService.getTotalBalanceAndRewards()),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.stakingLpService.toggleLoading('balanceAndRewards', false);
        this.cdr.markForCheck();
      });

    this.stakingLpService
      .getTvlMultichain()
      .pipe(
        switchMap(() => this.stakingLpService.getTvlStaking()),
        tap(() => this.stakingLpService.getTotalTvl()),
        switchMap(() => this.stakingLpService.getTtv()),
        take(1)
      )
      .subscribe(() => {
        this.stakingLpService.toggleLoading('tvlAndTtv', false);
        this.cdr.markForCheck();
      });
  }

  public refreshStatistics(): void {
    this.stakingLpService
      .getTotalBalanceAndRewards()
      .pipe(take(1))
      .subscribe(() => {
        this.stakingLpService.toggleLoading('balanceAndRewards', false);
      });

    this.stakingLpService
      .getTvlMultichain()
      .pipe(
        switchMap(() => this.stakingLpService.getTvlStaking()),
        tap(() => this.stakingLpService.getTotalTvl()),
        switchMap(() => this.stakingLpService.getTtv()),
        take(1)
      )
      .subscribe(() => {
        this.stakingLpService.toggleLoading('tvlAndTtv', false);
      });
  }

  public toggleHintsMobile(): void {
    if (this.headerStore.isMobile) {
      this.balanceHintShown = !this.balanceHintShown;
      this.rewardsHintShow = !this.rewardsHintShow;
    }
  }

  public toggleFilters(): void {
    this.ttvFiltersOpen = !this.ttvFiltersOpen;
  }

  public onFilterSelect(period: TtvFilters): void {
    this.ttvFiltersOpen = false;
    this._selectedTtvFilter$.next(period);
  }
}

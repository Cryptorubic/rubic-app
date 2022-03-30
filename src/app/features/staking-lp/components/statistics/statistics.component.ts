import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, tap } from 'rxjs/operators';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsComponent implements OnInit {
  public readonly stakingBalance$ = this.stakingLpService.stakingBalance$;

  public readonly lpBalance$ = this.stakingLpService.lpBalance$;

  public readonly totalBalanceInUsdc$ = this.stakingLpService.totalBalanceInUsdc$;

  public readonly stakingRewards$ = this.stakingLpService.stakingRewards$;

  public readonly lpRewards$ = this.stakingLpService.lpRewards$;

  public readonly totalRewardsInUsdc$ = this.stakingLpService.totalRewardsInUsdc$;

  public readonly statisticsLoading$ = this.stakingLpService.statisticsLoading$;

  private readonly _selectedTtvFilter$ = new BehaviorSubject<TtvFilters>(TtvFilters.ALL_TIME);

  public readonly selectedTtvFilter$ = this._selectedTtvFilter$.asObservable();

  public balanceHintShown = false;

  public rewardsHintShow = false;

  public ttvFiltersOpen = false;

  public ttvFiltersText = TTV_FILTERS_TEXT;

  public readonly ttvFilters = Object.values(TtvFilters);

  constructor(
    private readonly stakingLpService: StakingLpService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.stakingLpService.getTotalBalanceAndRewards().subscribe(() => {
      this.stakingLpService.toggleStatisticsLoading(false);
      this.cdr.detectChanges();
    });
  }

  public refreshStatistics(): void {
    this.stakingLpService
      .getTotalBalanceAndRewards()
      .pipe(take(1), tap(console.log))
      .subscribe(() => {
        this.stakingLpService.toggleStatisticsLoading(false);
        this.cdr.detectChanges();
      });
  }

  public toggleHint(type: 'balance' | 'rewards'): void {
    if (type === 'balance') {
      this.balanceHintShown = !this.balanceHintShown;
    }

    if (type === 'rewards') {
      this.rewardsHintShow = !this.rewardsHintShow;
    }
  }

  public toggleFilters(): void {
    this.ttvFiltersOpen = !this.ttvFiltersOpen;
  }

  public onFilterSelect(filter: TtvFilters): void {
    this.ttvFiltersOpen = false;
    this._selectedTtvFilter$.next(filter);
  }
}

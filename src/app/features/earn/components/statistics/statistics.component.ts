import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { StatisticsService } from '@features/earn/services/statistics.service';
import { HeaderStore } from '@core/header/services/header.store';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StatisticsComponent implements OnInit {
  public readonly lockedRBC$ = this.statisticsService.lockedRBC$;

  public readonly lockedRBCInDollars$ = this.statisticsService.lockedRBCInDollars$;

  public readonly circRBCLocked$ = this.statisticsService.circRBCLocked$;

  public readonly rewardPerSecond$ = this.statisticsService.rewardPerSecond$;

  public readonly apr$ = this.statisticsService.apr$;

  public loading = false;

  public readonly isMobile: boolean = false;

  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore
  ) {
    this.isMobile = this.headerStore.isMobile;
  }

  ngOnInit(): void {
    this.getStatisticsData();
  }

  public refreshStatistics(): void {
    this.loading = true;
    this.statisticsService.updateStatistics();
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  private getStatisticsData(): void {
    this.statisticsService.getLockedRBC();
  }
}

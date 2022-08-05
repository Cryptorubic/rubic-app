import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { StatisticsService } from '../../services/statistics.service';
import { HeaderStore } from '@core/header/services/header.store';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BehaviorSubject, map, skip } from 'rxjs';

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

  private readonly _currentTimestamp$ = new BehaviorSubject<number>(Date.now());

  public readonly aprExists$ = this._currentTimestamp$.asObservable().pipe(
    map(timestamp => {
      return timestamp > Date.UTC(2022, 7, 5, 11, 5);
    })
  );

  public loading = false;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
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
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  private getStatisticsData(): void {
    this.statisticsService.getLockedRBC();
  }
}

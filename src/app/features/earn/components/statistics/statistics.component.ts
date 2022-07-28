import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { StatisticsService } from '@features/earn/services/statistics.service';

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

  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.getStatisticsData();
  }

  public refreshStatistics(): void {
    this.statisticsService.updateStatistics();
  }

  private getStatisticsData(): void {
    this.statisticsService.getLockedRBC();
  }
}

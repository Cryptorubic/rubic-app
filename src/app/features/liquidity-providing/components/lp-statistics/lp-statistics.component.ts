import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-lp-statistics',
  templateUrl: './lp-statistics.component.html',
  styleUrls: ['./lp-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class LpStatisticsComponent implements OnInit {
  public readonly poolSize = this.lpService.poolSize;

  public readonly maxEnterAmount = this.lpService.maxEnterAmount;

  public readonly totalStaked$ = this.lpService.totalStaked$;

  public readonly usersTotalStaked$ = this.lpService.userTotalStaked$;

  public readonly apr$ = this.lpService.apr$;

  public readonly balance$ = this.lpService.balance$;

  public readonly rewardsToCollect$ = this.lpService.rewardsToCollect$;

  public readonly collectedRewards$ = this.lpService.totalCollectedRewards$;

  public readonly needLogin$ = this.lpService.needLogin$;

  public readonly statisticsLoading$ = this.lpService.statisticsLoading$;

  public readonly endDate = this.lpService.endDate;

  constructor(
    private readonly lpService: LiquidityProvidingService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        startWith(undefined),
        switchMap(() =>
          this.lpService
            .getAprAndTotalStaked()
            .pipe(switchMap(() => this.lpService.getStatistics()))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.lpService.setStatisticsLoading(false);
        this.cdr.detectChanges();
      });
  }

  public refreshStatistics(): void {
    this.lpService
      .getAprAndTotalStaked()
      .pipe(
        switchMap(() => this.lpService.getStatistics()),
        take(1)
      )
      .subscribe(() => {
        this.lpService.setStatisticsLoading(false);
        this.cdr.detectChanges();
      });
  }
}

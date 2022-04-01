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
  public readonly poolSize = this.service.poolSize;

  public readonly maxEnterAmount = this.service.maxEnterAmount;

  public readonly totalStaked$ = this.service.totalStaked$;

  public readonly usersTotalStaked$ = this.service.userTotalStaked$;

  public readonly apr$ = this.service.apr$;

  public readonly balance$ = this.service.balance$;

  public readonly rewardsToCollect$ = this.service.rewardsToCollect$;

  public readonly collectedRewards$ = this.service.totalCollectedRewards$;

  public readonly needLogin$ = this.service.needLogin$;

  public readonly statisticsLoading$ = this.service.statisticsLoading$;

  constructor(
    private readonly service: LiquidityProvidingService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        startWith(undefined),
        switchMap(() =>
          this.service.getAprAndTotalStaked().pipe(switchMap(() => this.service.getStatistics()))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.service.setStatisticsLoading(false);
        this.cdr.detectChanges();
      });
  }

  public refreshStatistics(): void {
    this.service
      .getAprAndTotalStaked()
      .pipe(
        switchMap(() => this.service.getStatistics()),
        take(1)
      )
      .subscribe(() => {
        this.service.setStatisticsLoading(false);
        this.cdr.detectChanges();
      });
  }
}

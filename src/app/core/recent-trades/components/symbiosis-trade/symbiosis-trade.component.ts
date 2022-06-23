import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { interval, switchMap } from 'rxjs';
import { map, startWith, tap, takeWhile, takeUntil } from 'rxjs/operators';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { UiRecentTrade } from '../../models/ui-recent-trade.interface';
import { RecentTradesService } from '../../services/recent-trades.service';
import { RecentTradeStatus } from '../../models/recent-trade-status.enum';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { getStatusBadgeText, getStatusBadgeType } from '../../utils/recent-trades-utils';

@Component({
  selector: '[symbiosis-trade]',
  templateUrl: './symbiosis-trade.component.html',
  styleUrls: ['./symbiosis-trade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymbiosisTradeComponent implements OnInit, OnDestroy {
  @Input() trade: RecentTrade;

  @Input() mode: 'mobile' | 'table-row';

  public uiTrade: UiRecentTrade;

  public initialLoading = true;

  public revertBtnLoading = false;

  public readonly RecentTradeStatus = RecentTradeStatus;

  public readonly getStatusBadgeType = getStatusBadgeType;

  public readonly getStatusBadgeText = getStatusBadgeText;

  constructor(
    private readonly recentTradesService: RecentTradesService,
    private readonly cdr: ChangeDetectorRef,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    @Inject(TuiDestroyService) private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    interval(30000)
      .pipe(
        startWith(-1),
        map(() => Date.now() - this.trade.timestamp > 120000),
        switchMap(isAverageSymbiosisTxTimeSpent => {
          return this.recentTradesService.getSymbiosisTradeData(
            this.trade,
            isAverageSymbiosisTxTimeSpent
          );
        }),
        tap(uiTrade => {
          if (!this.uiTrade || this.uiTrade?.statusTo !== RecentTradeStatus.FALLBACK) {
            this.uiTrade = uiTrade;

            if (this.initialLoading) {
              this.initialLoading = false;
            }
          }
        }),
        watch(this.cdr),
        takeWhile(uiTrade => uiTrade?.statusTo === RecentTradeStatus.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public async revertSymbiosis(): Promise<void> {
    this.revertBtnLoading = true;

    const revertTxReceipt = await this.recentTradesService.revertSymbiosis(
      this.trade.srcTxHash,
      this.trade.fromBlockchain
    );

    if (revertTxReceipt.status) {
      this.uiTrade.statusTo = RecentTradeStatus.FALLBACK;
      this.revertBtnLoading = false;
      this.cdr.detectChanges();
    }
  }

  public ngOnDestroy(): void {
    if (this.uiTrade.statusTo === RecentTradeStatus.SUCCESS) {
      this.recentTradesStoreService.updateTrade({
        ...this.trade,
        calculatedStatusTo: RecentTradeStatus.SUCCESS,
        calculatedStatusFrom: RecentTradeStatus.SUCCESS
      });
    }
  }
}

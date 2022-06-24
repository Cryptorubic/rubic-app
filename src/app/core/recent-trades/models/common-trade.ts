import { ChangeDetectorRef, Inject } from '@angular/core';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { interval } from 'rxjs';
import { startWith, switchMap, tap, takeWhile, takeUntil } from 'rxjs/operators';
import { RecentTradesService } from '../services/recent-trades.service';
import { getStatusBadgeText, getStatusBadgeType } from '../utils/recent-trades-utils';
import { RecentTradeStatus } from './recent-trade-status.enum';
import { UiRecentTrade } from './ui-recent-trade.interface';
import { watch } from '@taiga-ui/cdk';

export abstract class CommonTrade {
  public abstract trade: RecentTrade;

  public abstract mode: 'mobile' | 'table-row';

  public uiTrade: UiRecentTrade;

  public initialLoading = true;

  public readonly RecentTradeStatus = RecentTradeStatus;

  public readonly getStatusBadgeType = getStatusBadgeType;

  public readonly getStatusBadgeText = getStatusBadgeText;

  constructor(
    public readonly recentTradesStoreService: RecentTradesStoreService,
    public readonly recentTradesService: RecentTradesService,
    public readonly cdr: ChangeDetectorRef,
    @Inject(TuiDestroyService) protected readonly destroy$: TuiDestroyService
  ) {}

  public abstract getTradeData(trade: RecentTrade): Promise<UiRecentTrade>;

  public initTradeDataPolling(): void {
    interval(30000)
      .pipe(
        startWith(-1),
        switchMap(() => this.getTradeData(this.trade)),
        tap(uiTrade => this.setUiTrade(uiTrade)),
        watch(this.cdr),
        takeWhile(uiTrade => uiTrade?.statusTo === RecentTradeStatus.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public setUiTrade(uiTrade: UiRecentTrade): void {
    this.uiTrade = uiTrade;
    if (this.initialLoading) {
      this.initialLoading = false;
    }
  }

  public saveTradeOnDestroy(): void {
    if (this.uiTrade.statusTo === RecentTradeStatus.SUCCESS) {
      this.recentTradesStoreService.updateTrade({
        ...this.trade,
        calculatedStatusTo: RecentTradeStatus.SUCCESS,
        calculatedStatusFrom: RecentTradeStatus.SUCCESS
      });
    }
  }
}

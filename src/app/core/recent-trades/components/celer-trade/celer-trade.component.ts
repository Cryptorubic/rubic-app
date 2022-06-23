import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { interval, startWith, switchMap } from 'rxjs';
import { tap, takeWhile, takeUntil } from 'rxjs/operators';
import { RecentTradeStatus } from '../../models/recent-trade-status.enum';
import { UiRecentTrade } from '../../models/ui-recent-trade.interface';
import { RecentTradesService } from '../../services/recent-trades.service';
import { getStatusBadgeText, getStatusBadgeType } from '../../utils/recent-trades-utils';

@Component({
  selector: '[celer-trade]',
  templateUrl: './celer-trade.component.html',
  styleUrls: ['./celer-trade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CelerTradeComponent implements OnInit, OnDestroy {
  @Input() trade: RecentTrade;

  @Input() mode: 'mobile' | 'table-row';

  public uiTrade: UiRecentTrade;

  public initialLoading = true;

  public readonly RecentTradeStatus = RecentTradeStatus;

  public readonly getStatusBadgeType = getStatusBadgeType;

  public readonly getStatusBadgeText = getStatusBadgeText;

  constructor(
    private readonly recentTradesService: RecentTradesService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(TuiDestroyService) private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    interval(30000)
      .pipe(
        startWith(-1),
        switchMap(() => this.recentTradesService.getCelerTradeData(this.trade)),
        tap(uiTrade => {
          this.uiTrade = uiTrade;
          if (this.initialLoading) {
            this.initialLoading = false;
          }
        }),
        watch(this.cdr),
        takeWhile(uiTrade => uiTrade?.statusTo === RecentTradeStatus.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
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

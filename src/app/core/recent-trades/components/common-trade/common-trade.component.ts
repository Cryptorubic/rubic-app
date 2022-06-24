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
import { TuiDestroyService } from '@taiga-ui/cdk';
import { interval } from 'rxjs';
import { switchMap, tap, startWith, takeWhile, takeUntil } from 'rxjs/operators';
import { RecentTradeStatus } from '../../models/recent-trade-status.enum';
import { UiRecentTrade } from '../../models/ui-recent-trade.interface';
import { RecentTradesService } from '../../services/recent-trades.service';
import { getStatusBadgeText, getStatusBadgeType } from '../../utils/recent-trades-utils';
import { watch } from '@taiga-ui/cdk';
import { CROSS_CHAIN_PROVIDER } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';

@Component({
  selector: 'app-common-trade',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonTradeComponent implements OnInit, OnDestroy {
  @Input() trade: RecentTrade;

  @Input() mode: 'mobile' | 'table-row';

  public uiTrade: UiRecentTrade;

  public initialLoading = true;

  public readonly RecentTradeStatus = RecentTradeStatus;

  public readonly getStatusBadgeType = getStatusBadgeType;

  public readonly getStatusBadgeText = getStatusBadgeText;

  constructor(
    readonly recentTradesService: RecentTradesService,
    readonly recentTradesStoreService: RecentTradesStoreService,
    readonly cdr: ChangeDetectorRef,
    @Inject(TuiDestroyService) protected readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.initTradeDataPolling();
  }

  initTradeDataPolling(): void {
    interval(30000)
      .pipe(
        startWith(-1),
        switchMap(() => this.getTradeData()),
        tap(uiTrade => this.setUiTrade(uiTrade)),
        watch(this.cdr),
        takeWhile(uiTrade => uiTrade?.statusTo === RecentTradeStatus.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  async getTradeData(): Promise<UiRecentTrade> {
    switch (this.trade.crossChainProviderType) {
      case CROSS_CHAIN_PROVIDER.CELER:
        return this.recentTradesService.getCelerTradeData(this.trade);
      case CROSS_CHAIN_PROVIDER.RUBIC:
        return this.recentTradesService.getRubicTradeData(this.trade);
      case CROSS_CHAIN_PROVIDER.SYMBIOSIS:
        return this.recentTradesService.getSymbiosisTradeData(this.trade);
    }
  }

  setUiTrade(uiTrade: UiRecentTrade): void {
    this.uiTrade = uiTrade;
    if (this.initialLoading) {
      this.initialLoading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.uiTrade.statusTo === RecentTradeStatus.SUCCESS) {
      this.recentTradesStoreService.updateTrade({
        ...this.trade,
        calculatedStatusTo: RecentTradeStatus.SUCCESS,
        calculatedStatusFrom: RecentTradeStatus.SUCCESS
      });
    }
  }
}

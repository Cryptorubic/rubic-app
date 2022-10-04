import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { interval } from 'rxjs';
import { startWith, switchMap, tap, takeWhile, takeUntil } from 'rxjs/operators';
import { getStatusBadgeText, getStatusBadgeType } from '../utils/recent-trades-utils';
import { UiRecentTrade } from './ui-recent-trade.interface';
import { watch } from '@taiga-ui/cdk';
import { TxStatus } from 'rubic-sdk';

@Directive()
export abstract class CommonTrade implements OnInit, OnDestroy {
  @Input() trade: RecentTrade;

  @Input() mode: 'mobile' | 'table-row';

  public uiTrade: UiRecentTrade;

  public initialLoading = true;

  public readonly CrossChainTxStatus = TxStatus;

  public readonly getStatusBadgeType: (status: TxStatus) => string = getStatusBadgeType;

  public readonly getStatusBadgeText: (status: TxStatus) => string = getStatusBadgeText;

  protected constructor(
    protected readonly recentTradesStoreService: RecentTradesStoreService,
    protected readonly cdr: ChangeDetectorRef,
    protected readonly destroy$: TuiDestroyService
  ) {}

  public abstract getTradeData(trade: RecentTrade): Promise<UiRecentTrade>;

  ngOnInit(): void {
    this.initTradeDataPolling();
  }

  protected initTradeDataPolling(): void {
    interval(30000)
      .pipe(
        startWith(-1),
        switchMap(() => this.getTradeData(this.trade)),
        tap(uiTrade => this.setUiTrade(uiTrade)),
        watch(this.cdr),
        takeWhile(uiTrade => uiTrade?.statusTo === TxStatus.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  protected setUiTrade(uiTrade: UiRecentTrade): void {
    this.uiTrade = uiTrade;
    if (this.initialLoading) {
      this.initialLoading = false;
    }
  }

  protected saveTradeOnDestroy(): void {
    const isCrossChainFinished = this.uiTrade.statusTo !== TxStatus.PENDING;
    this.recentTradesStoreService.updateTrade({
      ...this.trade,
      ...(isCrossChainFinished && {
        calculatedStatusTo: this.uiTrade.statusTo,
        calculatedStatusFrom: this.uiTrade.statusFrom
      }),
      dstTxHash: this.uiTrade.dstTxHash
    });
  }

  ngOnDestroy(): void {
    this.saveTradeOnDestroy();
  }
}

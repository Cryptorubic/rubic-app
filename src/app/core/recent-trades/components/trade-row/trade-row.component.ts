import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { RecentTradesService } from '../../services/recent-trades.service';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { UiRecentTrade } from '../../models/ui-recent-trade.interface';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { CROSS_CHAIN_TRADE_TYPE, CrossChainTxStatus } from 'rubic-sdk';
import { interval } from 'rxjs';
import { startWith, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { getStatusBadgeText, getStatusBadgeType } from '../../utils/recent-trades-utils';
import { TokensService } from '@core/services/tokens/tokens.service';

@Component({
  selector: '[trade-row]',
  templateUrl: './trade-row.component.html',
  styleUrls: ['./trade-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradeRowComponent implements OnInit, OnDestroy {
  public revertBtnLoading = false;

  @Input() trade: RecentTrade;

  @Input() mode: 'mobile' | 'table-row';

  public uiTrade: UiRecentTrade;

  public initialLoading = true;

  public readonly CrossChainTxStatus = CrossChainTxStatus;

  public readonly getStatusBadgeType: (status: CrossChainTxStatus) => string = getStatusBadgeType;

  public readonly getStatusBadgeText: (status: CrossChainTxStatus) => string = getStatusBadgeText;

  public get isSymbiosisTrade(): boolean {
    return this.uiTrade?.crossChainProviderType === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;
  }

  constructor(
    private readonly recentTradesService: RecentTradesService,
    protected readonly recentTradesStoreService: RecentTradesStoreService,
    protected readonly cdr: ChangeDetectorRef,
    @Inject(TuiDestroyService) protected readonly destroy$: TuiDestroyService,
    private readonly tokensService: TokensService
  ) {}

  ngOnInit(): void {
    this.initTradeDataPolling();
  }

  ngOnDestroy(): void {
    this.saveTradeOnDestroy();
  }

  public async getTradeData(trade: RecentTrade): Promise<UiRecentTrade> {
    return await this.recentTradesService.getTradeData(trade);
  }

  public setUiTrade(uiTrade: UiRecentTrade): void {
    if (!this.uiTrade || this.uiTrade?.statusTo !== CrossChainTxStatus.FALLBACK) {
      this.uiTrade = uiTrade;

      if (this.initialLoading) {
        this.initialLoading = false;
      }
    }
  }

  public async revertSymbiosis(): Promise<void> {
    this.revertBtnLoading = true;

    const revertTxReceipt = await this.recentTradesService.revertSymbiosis(
      this.trade.srcTxHash,
      this.trade.fromBlockchain
    );

    if (revertTxReceipt.status) {
      this.uiTrade.statusTo = CrossChainTxStatus.FALLBACK;
      this.revertBtnLoading = false;
      this.cdr.detectChanges();
    }
  }

  protected initTradeDataPolling(): void {
    interval(30000)
      .pipe(
        startWith(-1),
        switchMap(() => this.getTradeData(this.trade)),
        tap(uiTrade => this.setUiTrade(uiTrade)),
        watch(this.cdr),
        takeWhile(uiTrade => uiTrade?.statusTo === CrossChainTxStatus.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  protected saveTradeOnDestroy(): void {
    if (this.uiTrade.statusTo === CrossChainTxStatus.SUCCESS) {
      this.recentTradesStoreService.updateTrade({
        ...this.trade,
        calculatedStatusTo: CrossChainTxStatus.SUCCESS,
        calculatedStatusFrom: CrossChainTxStatus.SUCCESS
      });
    }
  }

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}

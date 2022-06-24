import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { RecentTradesService } from '../../services/recent-trades.service';
import { RecentTradeStatus } from '../../models/recent-trade-status.enum';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { CommonTradeComponent } from '../common-trade/common-trade.component';
import { UiRecentTrade } from '../../models/ui-recent-trade.interface';

@Component({
  selector: '[symbiosis-trade]',
  templateUrl: './symbiosis-trade.component.html',
  styleUrls: ['./symbiosis-trade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymbiosisTradeComponent extends CommonTradeComponent {
  public revertBtnLoading = false;

  constructor(
    readonly recentTradesService: RecentTradesService,
    readonly recentTradesStoreService: RecentTradesStoreService,
    readonly cdr: ChangeDetectorRef,
    @Inject(TuiDestroyService) protected readonly destroy$: TuiDestroyService
  ) {
    super(recentTradesService, recentTradesStoreService, cdr, destroy$);
  }

  setUiTrade(uiTrade: UiRecentTrade): void {
    if (!this.uiTrade || this.uiTrade?.statusTo !== RecentTradeStatus.FALLBACK) {
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
      this.uiTrade.statusTo = RecentTradeStatus.FALLBACK;
      this.revertBtnLoading = false;
      this.cdr.detectChanges();
    }
  }
}

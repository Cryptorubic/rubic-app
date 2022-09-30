import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { RecentTradesService } from '../../services/recent-trades.service';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { UiRecentTrade } from '../../models/ui-recent-trade.interface';
import { CommonTrade } from '../../models/common-trade';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';

@Component({
  selector: '[bridgers-trade]',
  templateUrl: './bridgers-trade.component.html',
  styleUrls: ['./bridgers-trade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BridgersTradeComponent extends CommonTrade {
  constructor(
    private readonly recentTradesService: RecentTradesService,
    protected readonly recentTradesStoreService: RecentTradesStoreService,
    protected readonly cdr: ChangeDetectorRef,
    @Inject(TuiDestroyService) protected readonly destroy$: TuiDestroyService
  ) {
    super(recentTradesStoreService, cdr, destroy$);
  }

  public async getTradeData(trade: RecentTrade): Promise<UiRecentTrade> {
    return this.recentTradesService.getTradeData(trade);
  }
}

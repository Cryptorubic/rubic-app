import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { CommonTrade } from '../../models/common-trade';
import { UiRecentTrade } from '../../models/ui-recent-trade.interface';
import { RecentTradesService } from '../../services/recent-trades.service';

@Component({
  selector: '[celer-trade]',
  templateUrl: './celer-trade.component.html',
  styleUrls: ['./celer-trade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CelerTradeComponent extends CommonTrade {
  @Input() trade: RecentTrade;

  @Input() mode: 'table-row' | 'mobile';

  constructor(
    public readonly recentTradesService: RecentTradesService,
    protected readonly recentTradesStoreService: RecentTradesStoreService,
    protected readonly cdr: ChangeDetectorRef,
    @Inject(TuiDestroyService) protected readonly destroy$: TuiDestroyService
  ) {
    super(recentTradesStoreService, cdr, destroy$);
  }

  public async getTradeData(trade: RecentTrade): Promise<UiRecentTrade> {
    return await this.recentTradesService.getCelerTradeData(trade);
  }
}

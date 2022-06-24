import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { RecentTradesService } from '../../services/recent-trades.service';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { CommonTrade } from '../../models/common-trade';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { UiRecentTrade } from '../../models/ui-recent-trade.interface';

@Component({
  selector: '[rubic-trade]',
  templateUrl: './rubic-trade.component.html',
  styleUrls: ['./rubic-trade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicTradeComponent extends CommonTrade implements OnInit, OnDestroy {
  @Input() trade: RecentTrade;

  @Input() mode: 'table-row' | 'mobile';

  constructor(
    public readonly recentTradesService: RecentTradesService,
    public readonly recentTradesStoreService: RecentTradesStoreService,
    public readonly cdr: ChangeDetectorRef,
    @Inject(TuiDestroyService) protected readonly destroy$: TuiDestroyService
  ) {
    super(recentTradesStoreService, recentTradesService, cdr, destroy$);
  }

  public async getTradeData(trade: RecentTrade): Promise<UiRecentTrade> {
    return await this.recentTradesService.getRubicTradeData(trade);
  }

  public ngOnInit(): void {
    this.initTradeDataPolling();
  }

  public ngOnDestroy(): void {
    this.saveTradeOnDestroy();
  }
}

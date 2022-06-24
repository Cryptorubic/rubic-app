import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { RecentTradesService } from '../../services/recent-trades.service';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { CommonTradeComponent } from '../common-trade/common-trade.component';

@Component({
  selector: '[rubic-trade]',
  templateUrl: './rubic-trade.component.html',
  styleUrls: ['./rubic-trade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicTradeComponent extends CommonTradeComponent implements OnInit {
  constructor(
    readonly recentTradesService: RecentTradesService,
    readonly recentTradesStoreService: RecentTradesStoreService,
    readonly cdr: ChangeDetectorRef,
    @Inject(TuiDestroyService) protected readonly destroy$: TuiDestroyService
  ) {
    super(recentTradesService, recentTradesStoreService, cdr, destroy$);
  }
}

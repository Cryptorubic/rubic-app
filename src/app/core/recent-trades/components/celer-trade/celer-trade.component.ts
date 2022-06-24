import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { RecentTradesService } from '../../services/recent-trades.service';
import { CommonTradeComponent } from '../common-trade/common-trade.component';

@Component({
  selector: '[celer-trade]',
  templateUrl: './celer-trade.component.html',
  styleUrls: ['./celer-trade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CelerTradeComponent extends CommonTradeComponent implements OnInit, OnDestroy {
  constructor(
    readonly recentTradesService: RecentTradesService,
    readonly recentTradesStoreService: RecentTradesStoreService,
    readonly cdr: ChangeDetectorRef,
    @Inject(TuiDestroyService) protected readonly destroy$: TuiDestroyService
  ) {
    super(recentTradesService, recentTradesStoreService, cdr, destroy$);
  }
}

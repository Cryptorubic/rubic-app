import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { RecentTrade } from '@shared/models/recent-trades/recent-trade';
import { RecentTradesService } from '@core/recent-trades/services/recent-trades.service';
import { Router } from '@angular/router';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-recent-cross-chain-table-tx',
  templateUrl: './recent-cross-chain-table.component.html',
  styleUrls: ['./recent-cross-chain-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentCrossChainTableTxComponent {
  @Input() public recentTrades: RecentTrade[];

  public readonly isMobile = this.recentTradesService.isMobile;

  constructor(
    private readonly recentTradesService: RecentTradesService,
    private readonly router: Router,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext
  ) {}

  public onClose(): void {
    this.context.completeWith(null);
  }

  public navigateToCrossChainSwaps(): void {
    this.router.navigate(['/']).then(() => this.context.completeWith(null));
  }
}

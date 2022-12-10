import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecentTradesService } from '../../services/recent-trades.service';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-recent-crosschain-tx',
  templateUrl: './recent-crosschain-tx.component.html',
  styleUrls: ['./recent-crosschain-tx.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentCrosschainTxComponent implements OnInit {
  public readonly recentTrades = this.recentTradesService.recentTrades;

  public readonly isMobile = this.recentTradesService.isMobile;

  constructor(
    private readonly recentTradesService: RecentTradesService,
    private readonly router: Router,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext
  ) {}

  public ngOnInit(): void {
    this.recentTradesService.readAllTrades();
  }

  public onClose(): void {
    this.context.completeWith(null);
  }

  public navigateToCrossChainSwaps(): void {
    this.router.navigate(['/']).then(() => this.context.completeWith(null));
  }
}

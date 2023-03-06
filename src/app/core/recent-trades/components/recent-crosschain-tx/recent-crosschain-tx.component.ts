import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { RecentTradesService } from '../../services/recent-trades.service';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recent-crosschain-tx',
  templateUrl: './recent-crosschain-tx.component.html',
  styleUrls: ['./recent-crosschain-tx.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentCrosschainTxComponent implements OnInit {
  public readonly recentTrades = this.recentTradesService.recentTrades;

  constructor(
    private readonly recentTradesService: RecentTradesService,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext,
    private readonly router: Router
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

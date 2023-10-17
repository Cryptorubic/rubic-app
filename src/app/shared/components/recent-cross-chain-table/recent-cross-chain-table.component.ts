import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RecentTrade } from '@shared/models/recent-trades/recent-trade';
import { RecentTradesService } from '@core/recent-trades/services/recent-trades.service';

@Component({
  selector: 'app-recent-cross-chain-table-tx',
  templateUrl: './recent-cross-chain-table.component.html',
  styleUrls: ['./recent-cross-chain-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentCrossChainTableTxComponent {
  @Input() public recentTrades: Array<RecentTrade>;

  @Output() onClose = new EventEmitter<void>();

  @Output() navigateToCrossChainSwaps = new EventEmitter<void>();

  public closeModal(): void {
    this.onClose.emit();
  }

  public navigateToCrossChainSwapsOnClick(): void {
    this.navigateToCrossChainSwaps.emit();
  }

  public readonly isMobile = this.recentTradesService.isMobile;

  constructor(private readonly recentTradesService: RecentTradesService) {}
}

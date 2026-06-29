import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { UnreadTradesService } from '@core/services/unread-trades-service/unread-trades.service';

@Component({
  standalone: false,
  selector: 'app-history-view',
  templateUrl: './history-view.component.html',
  styleUrls: ['./history-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryViewComponent {
  constructor(
    private readonly recentTradesStoreService: UnreadTradesService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.readAllTrades();
  }

  public readAllTrades(): void {
    this.walletConnectorService.activeWallets.forEach(wallet => {
      this.recentTradesStoreService.updateUnreadTrades(wallet.address, true);
    });
  }
}

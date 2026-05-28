import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UnreadTradesService } from '@core/services/unread-trades-service/unread-trades.service';
import { ModalService } from '@core/modals/services/modal.service';
import { HeaderStore } from '@core/header/services/header.store';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

@Component({
  selector: 'app-history-button',
  templateUrl: './history-button.component.html',
  styleUrls: ['./history-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryButtonComponent {
  public readonly unreadTrades$ = this.recentTradesStoreService.unreadTrades$;

  public readonly activeWallets$ = this.walletConnectorService.activeWallets$;

  constructor(
    private readonly recentTradesStoreService: UnreadTradesService,
    private readonly modalService: ModalService,
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService
  ) {}
}

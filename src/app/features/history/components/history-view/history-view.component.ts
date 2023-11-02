import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { map } from 'rxjs/operators';
import { ModalService } from '@core/modals/services/modal.service';
import { UnreadTradesService } from '@core/services/unread-trades-service/unread-trades.service';

@Component({
  selector: 'app-history-view',
  templateUrl: './history-view.component.html',
  styleUrls: ['./history-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryViewComponent {
  public readonly isUserActive$ = this.walletConnector.addressChange$.pipe(map(Boolean));

  constructor(
    private readonly walletConnector: WalletConnectorService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly recentTradesStoreService: UnreadTradesService
  ) {
    this.readAllTrades();
  }

  public connectWallet(): void {
    this.modalService.openWalletModal(this.injector).subscribe();
  }

  public readAllTrades(): void {
    this.recentTradesStoreService.updateUnreadTrades(true);
  }
}

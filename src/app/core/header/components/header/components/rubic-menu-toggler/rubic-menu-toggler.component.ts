import { Component } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { UnreadTradesService } from '@core/services/unread-trades-service/unread-trades.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-rubic-menu-toggler',
  templateUrl: './rubic-menu-toggler.component.html',
  styleUrls: ['./rubic-menu-toggler.component.scss']
})
export class RubicMenuTogglerComponent {
  public readonly isMobile = this.headerStore.isMobile;

  public isOpened = false;

  public readonly hasActiveWallet$ = this.walletConnectorService.activeWallets$.pipe(
    map(activeWallets => !!activeWallets.length)
  );

  public readonly unreadTrades$ = this.recentTradesStoreService.unreadTrades$;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly recentTradesStoreService: UnreadTradesService
  ) {}

  public closeMenu(): void {
    this.isOpened = false;
  }
}

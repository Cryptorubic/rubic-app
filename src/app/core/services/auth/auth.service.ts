import { Injectable } from '@angular/core';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { WalletConnectorService } from 'src/app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HeaderStore } from '../../header/services/header.store';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

/**
 * Service that provides methods for working with authentication and user interaction.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly errorService: ErrorsService,
    private readonly gtmService: GoogleTagManagerService
  ) {}

  /**
   * Checks if storage contains information about user and tries to connect.
   */
  public async loadStorageUser(): Promise<void> {
    const success = await this.walletConnectorService.setupProviders();
    // this._currentUser$.next(null);
    if (!success) {
      return;
    }

    // this.connectWallet({ hideError: true });
  }

  public async connectWallet(options: {
    walletName: WALLET_NAME;
    chainId?: number;
    hideError?: boolean;
  }): Promise<void> {
    try {
      const { walletName } = options;
      const walletAdapter = this.walletConnectorService.connectProvider(
        walletName,
        options.chainId
      );
      await this.walletConnectorService.activate(walletAdapter);

      if (walletName) {
        this.gtmService.fireConnectWalletEvent(walletName);
      }
    } catch (err) {
      this.walletConnectorService.deactivate(options.walletName);
      this.headerStore.setWalletsLoadingStatus(false); // @todo move
      if (!options.hideError) {
        this.errorService.catch(err);
      }
    }
  }

  public disconnectWallet(walletName: WALLET_NAME): void {
    this.walletConnectorService.deactivate(walletName);
  }
}

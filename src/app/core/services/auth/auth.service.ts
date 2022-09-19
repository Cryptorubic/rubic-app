import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { HeaderStore } from '../../header/services/header.store';
import { UserInterface } from './models/user.interface';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { BrowserService } from '../browser/browser.service';
import { BROWSER } from '@app/shared/models/browser/browser';
import { compareAddresses } from '@shared/utils/utils';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { CHAIN_TYPE } from 'rubic-sdk';

/**
 * Service that provides methods for working with authentication and user interaction.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _currentUser$ = new BehaviorSubject<UserInterface>(undefined);

  public readonly currentUser$ = this._currentUser$.asObservable();

  get user(): UserInterface {
    return this._currentUser$.getValue();
  }

  get userAddress(): string {
    return this.user?.address;
  }

  get userChainType(): string {
    return this.user?.chainType;
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly errorService: ErrorsService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly browserService: BrowserService
  ) {}

  private setCurrentUser(address: string, chainType: CHAIN_TYPE): void {
    if (!compareAddresses(address, this.userAddress)) {
      this._currentUser$.next({ address, chainType });
    }
  }

  /**
   * Checks if storage contains information about user and tries to connect.
   */
  public async loadStorageUser(): Promise<void> {
    const success = await this.walletConnectorService.setupProvider();
    if (!success) {
      this._currentUser$.next(null);
      return;
    }

    await this.connectWallet();
  }

  public async connectWallet(provider?: WALLET_NAME, chainId?: number): Promise<void> {
    try {
      if (!this.walletConnectorService.provider) {
        const connectionSuccessful = await this.walletConnectorService.connectProvider(
          provider,
          chainId
        );
        if (!connectionSuccessful) {
          this.disconnectWallet();
          return;
        }
      }

      let permissions: boolean;
      const isMetamaskBrowser = this.browserService.currentBrowser === BROWSER.METAMASK;
      if (!isMetamaskBrowser) {
        const walletPermissions = await this.walletConnectorService.requestPermissions();
        permissions = walletPermissions.some(
          permission => permission.parentCapability === 'eth_accounts'
        );
      } else {
        permissions = true;
      }

      if (permissions) {
        await this.walletConnectorService.activate();
        const { address, chainType } = this.walletConnectorService;
        this.setCurrentUser(address, chainType);

        if (provider) {
          this.gtmService.fireConnectWalletEvent(provider);
        }
      } else {
        this._currentUser$.next(null);
      }
    } catch (err) {
      this.walletConnectorService.deActivate();
      this._currentUser$.next(null);
      this.headerStore.setWalletsLoadingStatus(false); // @todo move
      this.errorService.catch(err);
    }
  }

  public disconnectWallet(): void {
    this.walletConnectorService.deActivate();
    this._currentUser$.next(null);
  }
}

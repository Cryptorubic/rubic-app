import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../../../services/auth/auth.service';
import { WALLET_NAME, WalletProvider } from './models/providers';
import { HeaderStore } from '../../../../services/header.store';

@Component({
  selector: 'app-wallets-modal',
  templateUrl: './wallets-modal.component.html',
  styleUrls: ['./wallets-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletsModalComponent {
  @ViewChild('modal') modal: TemplateRef<any>;

  public readonly $walletsLoading: Observable<boolean>;

  private readonly allProviders: WalletProvider[];

  private readonly $mobileDisplayStatus: Observable<boolean>;

  public get providers(): WalletProvider[] {
    return this.isMobile
      ? this.allProviders.filter(provider => !provider.desktopOnly)
      : this.allProviders;
  }

  public get isMobile(): boolean {
    return new AsyncPipe(this.cdr).transform(this.$mobileDisplayStatus);
  }

  private setupMetamaskDeepLinking(): void {
    const metamaskAppLink = 'https://metamask.app.link/dapp/';
    window.location.assign(`${metamaskAppLink}${window.location.hostname}`);
  }

  constructor(
    private dialog: MatDialog,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.$walletsLoading = this.headerStore.getWalletsLoadingStatus();
    this.$mobileDisplayStatus = this.headerStore.getMobileDisplayStatus();
    this.allProviders = [
      {
        name: 'MetaMask',
        value: WALLET_NAME.METAMASK,
        img: './assets/images/icons/wallets/metamask.svg',
        desktopOnly: false
      },
      {
        name: 'Coinbase wallet',
        value: WALLET_NAME.WALLET_LINK,
        img: './assets/images/icons/wallets/coinbase.png',
        desktopOnly: true
      },
      {
        name: 'Wallet Connect',
        value: WALLET_NAME.WALLET_CONNECT,
        img: './assets/images/icons/wallets/walletconnect.svg',
        desktopOnly: false
      }
    ];
  }

  public async connectProvider(provider: WALLET_NAME): Promise<void> {
    if (this.isMobile && provider === WALLET_NAME.METAMASK && !window.ethereum) {
      this.setupMetamaskDeepLinking();
      return;
    }
    this.headerStore.setWalletsLoadingStatus(true);
    try {
      await this.providerConnectorService.connectProvider(provider);
    } catch (e) {
      this.headerStore.setWalletsLoadingStatus(false);
    }
    await this.authService.signIn();
    this.headerStore.setWalletsLoadingStatus(false);
    this.close();
  }

  public close(): void {
    this.headerStore.setWalletsLoadingStatus(false);
    this.dialog.closeAll();
  }
}

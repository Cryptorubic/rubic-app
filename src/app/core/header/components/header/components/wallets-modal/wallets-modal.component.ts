import { Component, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { WALLET_NAME, WalletProvider } from './models/providers';

@Component({
  selector: 'app-wallets-modal',
  templateUrl: './wallets-modal.component.html',
  styleUrls: ['./wallets-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletsModalComponent {
  @ViewChild('modal') modal: TemplateRef<any>;

  public readonly providers: WalletProvider[];

  constructor(
    private dialog: MatDialog,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService
  ) {
    this.providers = [
      {
        name: 'MetaMask',
        value: WALLET_NAME.METAMASK,
        img: './assets/images/icons/wallets/metamask.svg'
      },
      {
        name: 'Coinbase wallet',
        value: WALLET_NAME.WALLET_LINK,
        img: './assets/images/icons/wallets/coinbase.png'
      },
      {
        name: 'Wallet Connect',
        value: WALLET_NAME.WALLET_CONNECT,
        img: './assets/images/icons/wallets/walletconnect.svg'
      }
    ];
  }

  public async connectProvider(provider: WALLET_NAME): Promise<void> {
    await this.providerConnectorService.connectProvider(provider);
    const loginWithoutBackend = provider !== WALLET_NAME.METAMASK;
    await this.authService.signIn(loginWithoutBackend);
    this.close();
  }

  public close(): void {
    this.dialog.closeAll();
  }
}

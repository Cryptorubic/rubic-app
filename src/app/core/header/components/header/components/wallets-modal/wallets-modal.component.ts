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
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
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
    public readonly queryParamsService: QueryParamsService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.$walletsLoading = this.headerStore.getWalletsLoadingStatus();
    this.$mobileDisplayStatus = this.headerStore.getMobileDisplayStatus();
    this.allProviders = [
      {
        name: 'MetaMask',
        value: WALLET_NAME.METAMASK,
        img: './assets/images/icons/wallets/metamask.svg',
        desktopOnly: false,
        displayInIframe: false
      },
      // {
      //   name: 'Coinbase wallet',
      //   value: WALLET_NAME.WALLET_LINK,
      //   img: './assets/images/icons/wallets/coinbase.png',
      //   desktopOnly: true,
      //   displayInIframe: false
      // },
      {
        name: 'WalletConnect',
        value: WALLET_NAME.WALLET_CONNECT,
        img: './assets/images/icons/wallets/walletconnect.svg',
        desktopOnly: false,
        displayInIframe: true
      }
    ];
  }

  public async connectProvider(provider: WALLET_NAME): Promise<void> {
    if (this.isMobile && provider === WALLET_NAME.METAMASK && !window.ethereum) {
      this.setupMetamaskDeepLinking();
      return;
    }
    // @TODO Uncomment when fix mobile wallets.
    // if (
    //   provider ===
    //   WALLET_NAME.WALLET_CONNECT /** && /iPad|iPhone|iPod/.test(navigator.platform) * */
    // ) {
    //   setTimeout(() => this.setupIosWalletsModal(), 500);
    // }
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

  // @TODO Uncomment when fix mobile wallets.
  // private setupIosWalletsModal(): void {
  //   const walletElements = this.document.querySelectorAll(
  //     '#walletconnect-wrapper .walletconnect-connect__button__icon_anchor'
  //   );
  //   walletElements.forEach(el => {
  //     const wallet = el.querySelector('.walletconnect-connect__button__text').textContent;
  //     const deepLink =
  // tslint:disable-next-line:max-line-length
  //       'trust://wc?uri=wc%3Abbce77de-1fad-4bf3-a489-1734ad0ee5ed%401%3Fbridge%3Dhttps%253A%252F%252Fbridge.walletconnect.org%26key%3D4e5cb09af0367885cb93c836d826d2bfffa3845dad12531ccd770985b3f1d076';
  //     if (wallet === 'Trust') {
  //       this.renderer.setAttribute(el, 'href', deepLink);
  //     }
  //   });
  // }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnInit
} from '@angular/core';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { CoinbaseConfirmModalComponent } from 'src/app/core/wallets/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { WINDOW } from '@ng-web-apis/common';
import { BrowserService } from 'src/app/core/services/browser/browser.service';
import { BROWSER } from 'src/app/shared/models/browser/BROWSER';
import {
  WALLET_NAME,
  WalletProvider
} from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { IframeWalletsWarningComponent } from 'src/app/core/wallets/components/iframe-wallets-warning/iframe-wallets-warning.component';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

@Component({
  selector: 'app-wallets-modal',
  templateUrl: './wallets-modal.component.html',
  styleUrls: ['./wallets-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletsModalComponent implements OnInit {
  public readonly $walletsLoading: Observable<boolean>;

  private readonly allProviders: WalletProvider[];

  private readonly $mobileDisplayStatus: Observable<boolean>;

  public get providers(): WalletProvider[] {
    const deviceFiltered = this.isMobile
      ? this.allProviders.filter(provider => !provider.desktopOnly)
      : this.allProviders;

    return this.iframeService.isIframe && this.iframeService.device === 'mobile'
      ? deviceFiltered.filter(provider => provider.supportsInVerticalMobileIframe)
      : deviceFiltered;
  }

  public get isMobile(): boolean {
    return new AsyncPipe(this.cdr).transform(this.$mobileDisplayStatus);
  }

  private deepLinkRedirectIfSupported(provider: WALLET_NAME): boolean {
    switch (provider) {
      case WALLET_NAME.METAMASK:
        this.redirectToMetamaskBrowser();
        return true;
      case WALLET_NAME.WALLET_LINK:
        this.redirectToCoinbaseBrowser();
        return true;
      default:
        return false;
    }
  }

  private redirectToMetamaskBrowser(): void {
    const metamaskAppLink = 'https://metamask.app.link/dapp/';
    this.window.location.assign(`${metamaskAppLink}${this.window.location.hostname}`);
  }

  private redirectToCoinbaseBrowser(): void {
    const walletLinkAppLink = 'https://go.cb-w.com/9gaKnqLDajb';
    this.window.location.assign(walletLinkAppLink);
  }

  public shouldRenderAsLink(provider: WALLET_NAME): string | null {
    if (
      this.iframeService.isIframe &&
      this.iframeService.device === 'mobile' &&
      provider === WALLET_NAME.WALLET_LINK
    ) {
      return 'https://go.cb-w.com/9gaKnqLDajb';
    }

    return null;
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<void>,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(WINDOW) private readonly window: Window,
    private readonly translateService: TranslateService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef,
    private readonly browserService: BrowserService,
    private readonly iframeService: IframeService
  ) {
    this.$walletsLoading = this.headerStore.getWalletsLoadingStatus();
    this.$mobileDisplayStatus = this.headerStore.getMobileDisplayStatus();
    this.allProviders = [
      {
        name: 'MetaMask',
        value: WALLET_NAME.METAMASK,
        img: './assets/images/icons/wallets/metamask.svg',
        desktopOnly: false,
        display: true,
        supportsInHorizontalIframe: true,
        supportsInVerticalIframe: true,
        supportsInVerticalMobileIframe: false
      },
      {
        name: 'Coinbase wallet',
        value: WALLET_NAME.WALLET_LINK,
        img: './assets/images/icons/wallets/coinbase.png',
        desktopOnly: false,
        display: true,
        supportsInHorizontalIframe: false,
        supportsInVerticalIframe: false,
        supportsInVerticalMobileIframe: true
      },
      {
        name: 'WalletConnect',
        value: WALLET_NAME.WALLET_CONNECT,
        img: './assets/images/icons/wallets/walletconnect.svg',
        desktopOnly: false,
        display: true,
        supportsInHorizontalIframe: false,
        supportsInVerticalIframe: true,
        supportsInVerticalMobileIframe: true
      }
    ];
  }

  ngOnInit() {
    if (this.browserService.currentBrowser === BROWSER.METAMASK) {
      this.connectProvider(WALLET_NAME.METAMASK);
      return;
    }

    if (this.browserService.currentBrowser === BROWSER.COINBASE) {
      this.connectProvider(WALLET_NAME.WALLET_LINK);
    }
  }

  public async connectProvider(provider: WALLET_NAME): Promise<void> {
    const providerInfo = this.allProviders.find(elem => elem.value === provider);
    if (
      (this.iframeService.iframeAppearance === 'horizontal' &&
        !providerInfo.supportsInHorizontalIframe) ||
      (this.iframeService.iframeAppearance === 'vertical' && !providerInfo.supportsInVerticalIframe)
    ) {
      if (this.iframeService.device === 'desktop') {
        this.openIframeWarning();
        return;
      }
    }

    if (this.browserService.currentBrowser === BROWSER.MOBILE) {
      const redirected = this.deepLinkRedirectIfSupported(provider);
      if (redirected) {
        return;
      }
    }

    this.headerStore.setWalletsLoadingStatus(true);

    // desktop coinbase
    if (
      this.browserService.currentBrowser === BROWSER.DESKTOP &&
      provider === WALLET_NAME.WALLET_LINK
    ) {
      this.dialogService
        .open<BLOCKCHAIN_NAME>(
          new PolymorpheusComponent(CoinbaseConfirmModalComponent, this.injector),
          {
            dismissible: true,
            label: this.translateService.instant('modals.coinbaseSelectNetworkModal.title'),
            size: 'm'
          }
        )
        .subscribe({
          next: blockchainName => {
            if (blockchainName) {
              this.providerConnectorService.connectProvider(
                provider,
                BlockchainsInfo.getBlockchainByName(blockchainName).id
              );
              this.authService.signIn();
              this.close();
            }
          },
          complete: () => this.headerStore.setWalletsLoadingStatus(false)
        });
      return;
    }

    try {
      const connectionSuccessful = await this.providerConnectorService.connectProvider(provider);
      if (connectionSuccessful) {
        await this.authService.signIn();
      }
    } catch (e) {
      this.headerStore.setWalletsLoadingStatus(false);
    }
    this.headerStore.setWalletsLoadingStatus(false);
    this.close();
  }

  public close(): void {
    this.headerStore.setWalletsLoadingStatus(false);
    this.context.completeWith();
  }

  private openIframeWarning(): void {
    this.dialogService
      .open<boolean>(new PolymorpheusComponent(IframeWalletsWarningComponent, this.injector), {
        size: 'fullscreen'
      })
      .subscribe(confirm => {
        if (confirm) {
          this.connectProvider(WALLET_NAME.METAMASK);
        }
      });
  }
}

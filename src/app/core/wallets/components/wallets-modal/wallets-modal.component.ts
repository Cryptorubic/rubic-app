import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnInit
} from '@angular/core';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { CoinbaseConfirmModalComponent } from 'src/app/core/wallets/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { WINDOW } from '@ng-web-apis/common';
import { BrowserService } from 'src/app/core/services/browser/browser.service';
import { Browser } from '@shared/models/browser/browser';
import { WalletProvider } from '@core/wallets/components/wallets-modal/models/types';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { IframeWalletsWarningComponent } from 'src/app/core/wallets/components/iframe-wallets-warning/iframe-wallets-warning.component';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { WalletName } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { PROVIDERS_LIST } from '@core/wallets/components/wallets-modal/models/providers';

@Component({
  selector: 'app-wallets-modal',
  templateUrl: './wallets-modal.component.html',
  styleUrls: ['./wallets-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletsModalComponent implements OnInit {
  public readonly walletsLoading$: Observable<boolean>;

  private readonly allProviders: ReadonlyArray<WalletProvider>;

  private readonly mobileDisplayStatus$: Observable<boolean>;

  public get providers(): ReadonlyArray<WalletProvider> {
    const deviceFiltered = this.isMobile
      ? this.allProviders.filter(provider => !provider.desktopOnly)
      : this.allProviders.filter(provider => !provider.mobileOnly);

    return this.iframeService.isIframe && this.iframeService.device === 'mobile'
      ? deviceFiltered.filter(provider => provider.supportsInVerticalMobileIframe)
      : deviceFiltered;
  }

  public get isMobile(): boolean {
    return new AsyncPipe(this.cdr).transform(this.mobileDisplayStatus$);
  }

  private deepLinkRedirectIfSupported(provider: WalletName): boolean {
    switch (provider) {
      case WalletName.METAMASK:
        this.redirectToMetamaskBrowser();
        return true;
      case WalletName.WALLET_LINK:
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
    // How make link on coinbase deeplink https://github.com/walletlink/walletlink/issues/128
    const walletLinkAppLink = 'https://go.cb-w.com/cDgO1V5aDlb';
    this.window.location.assign(walletLinkAppLink);
  }

  public shouldRenderAsLink(provider: WalletName): string | null {
    if (
      this.iframeService.isIframe &&
      this.iframeService.device === 'mobile' &&
      provider === WalletName.WALLET_LINK
    ) {
      return 'https://go.cb-w.com/cDgO1V5aDlb';
    }

    return null;
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<void>,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(WINDOW) private readonly window: Window,
    private readonly translateService: TranslateService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef,
    private readonly browserService: BrowserService,
    private readonly iframeService: IframeService
  ) {
    this.walletsLoading$ = this.headerStore.getWalletsLoadingStatus();
    this.mobileDisplayStatus$ = this.headerStore.getMobileDisplayStatus();
    this.allProviders = PROVIDERS_LIST;
  }

  ngOnInit() {
    if (this.browserService.currentBrowser === Browser.METAMASK) {
      this.connectProvider(WalletName.METAMASK);
      return;
    }

    if (this.browserService.currentBrowser === Browser.COINBASE) {
      this.connectProvider(WalletName.WALLET_LINK);
    }
  }

  public async connectProvider(provider: WalletName): Promise<void> {
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

    if (this.browserService.currentBrowser === Browser.MOBILE) {
      const redirected = this.deepLinkRedirectIfSupported(provider);
      if (redirected) {
        return;
      }
    }

    this.headerStore.setWalletsLoadingStatus(true);

    // desktop coinbase
    if (
      this.browserService.currentBrowser === Browser.DESKTOP &&
      provider === WalletName.WALLET_LINK
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
          next: async blockchainName => {
            if (blockchainName) {
              await this.walletConnectorService.connectProvider(
                provider,
                BlockchainsInfo.getBlockchainByName(blockchainName).id
              );
              await this.authService.signIn();
              this.close();
            }
          },
          complete: () => this.headerStore.setWalletsLoadingStatus(false)
        });
      return;
    }

    try {
      const connectionSuccessful = await this.walletConnectorService.connectProvider(provider);
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
          this.connectProvider(WalletName.METAMASK);
        }
      });
  }
}

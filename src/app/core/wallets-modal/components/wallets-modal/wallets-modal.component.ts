import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnInit
} from '@angular/core';
import { USER_AGENT } from '@ng-web-apis/common';
import { WalletConnectorService } from 'src/app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AsyncPipe } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { CoinbaseConfirmModalComponent } from 'src/app/core/wallets-modal/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { blockchainId, BlockchainName } from 'rubic-sdk';
import { WINDOW } from '@ng-web-apis/common';
import { BrowserService } from 'src/app/core/services/browser/browser.service';
import { BROWSER } from '@shared/models/browser/browser';
import { WalletProvider } from '@core/wallets-modal/components/wallets-modal/models/types';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { IframeWalletsWarningComponent } from 'src/app/core/wallets-modal/components/iframe-wallets-warning/iframe-wallets-warning.component';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { PROVIDERS_LIST } from '@core/wallets-modal/components/wallets-modal/models/providers';
import { RubicWindow } from '@shared/utils/rubic-window';

@Component({
  selector: 'app-wallets-modal',
  templateUrl: './wallets-modal.component.html',
  styleUrls: ['./wallets-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletsModalComponent implements OnInit {
  public readonly walletsLoading$ = this.headerStore.getWalletsLoadingStatus();

  private readonly allProviders = PROVIDERS_LIST;

  private readonly mobileDisplayStatus$ = this.headerStore.getMobileDisplayStatus();

  public get providers(): ReadonlyArray<WalletProvider> {
    const browserSupportedProviders = Boolean(this.window.chrome)
      ? this.allProviders
      : this.allProviders.filter(provider => provider.value !== WALLET_NAME.BITKEEP);

    const deviceFiltered =
      this.isMobile && !this.iframeService.isIframe
        ? browserSupportedProviders.filter(
            provider => !provider.desktopOnly && provider.value !== WALLET_NAME.BITKEEP
          )
        : browserSupportedProviders.filter(provider => !provider.mobileOnly);

    return this.iframeService.isIframe && this.iframeService.device === 'mobile'
      ? deviceFiltered.filter(provider => provider.supportsInVerticalMobileIframe)
      : deviceFiltered;
  }

  public get isMobile(): boolean {
    return new AsyncPipe(this.cdr).transform(this.mobileDisplayStatus$);
  }

  // How make link on coinbase deeplink https://github.com/walletlink/walletlink/issues/128
  public readonly coinbaseDeeplink = 'https://go.cb-w.com/cDgO1V5aDlb';

  private readonly metamaskAppLink = 'https://metamask.app.link/dapp/';

  public readonly shouldRenderAsLink = (provider: WALLET_NAME): boolean => {
    return (
      this.iframeService.isIframe &&
      this.iframeService.device === 'mobile' &&
      provider === WALLET_NAME.WALLET_LINK
    );
  };

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<void>,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(WINDOW) private readonly window: RubicWindow,
    @Inject(USER_AGENT) private readonly userAgent: string,
    private readonly translateService: TranslateService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef,
    private readonly browserService: BrowserService,
    private readonly iframeService: IframeService
  ) {}

  ngOnInit() {
    if (this.browserService.currentBrowser === BROWSER.METAMASK) {
      this.connectProvider(WALLET_NAME.METAMASK);
      return;
    }

    if (this.browserService.currentBrowser === BROWSER.COINBASE) {
      this.connectProvider(WALLET_NAME.WALLET_LINK);
    }
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
    this.window.location.assign(`${this.metamaskAppLink}${this.window.location.hostname}`);
  }

  private redirectToCoinbaseBrowser(): void {
    this.window.location.assign(this.coinbaseDeeplink);
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
        .open<BlockchainName>(
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
              await this.authService.connectWallet({
                walletName: provider,
                chainId: blockchainId[blockchainName]
              });
              this.close();
            }
          },
          complete: () => this.headerStore.setWalletsLoadingStatus(false)
        });
      return;
    }

    try {
      await this.authService.connectWallet({ walletName: provider });
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

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { WA_WINDOW } from '@ng-web-apis/common';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { BrowserService } from 'src/app/core/services/browser/browser.service';
import { BROWSER } from '@shared/models/browser/browser';
import { WalletProvider } from '@core/wallets-modal/components/wallets-modal/models/types';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { PROVIDERS_LIST } from '@core/wallets-modal/components/wallets-modal/models/providers';
import { RubicWindow } from '@shared/utils/rubic-window';
import { firstValueFrom, from, of, startWith } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { FormControl } from '@angular/forms';
import { StoreService } from '@core/services/store/store.service';
import { IframeService } from '@app/core/services/iframe-service/iframe.service';
import { ModalService } from '@core/modals/services/modal.service';
import { WALLETS_DEEP_LINK_MAPPING } from './constants/wallets-deep-link-mapping';
import { WalletsModalOptions } from '@app/core/wallets-modal/components/wallets-modal/models/wallets-modal-options';
import { MULTICHAIN_OPTIONS_MAPPING } from './models/multichain-options-mapping';
import { METAMASK_PROVIDERS } from './models/metamask-providers';
import { Router } from '@angular/router';
import { PrivateProviderUrl } from '@app/features/privacy/models/routes';
import { WALLETS_TO_HIDE } from './models/wallets-to-hide-map';

@Component({
  standalone: false,
  selector: 'app-wallets-modal',
  templateUrl: './wallets-modal.component.html',
  styleUrls: ['./wallets-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: []
})
export class WalletsModalComponent implements OnInit {
  public readonly walletsLoading$ = this.headerStore.getWalletsLoadingStatus();

  private readonly allProviders: ReadonlyArray<WalletProvider>;

  private readonly mobileDisplayStatus$ = this.headerStore.getMobileDisplayStatus();

  private readonly showMetamaskModal: boolean;

  private readonly supportedMetamaskProvider: WALLET_NAME;

  public get providers(): ReadonlyArray<WalletProvider> {
    return this.isMobile
      ? this.allProviders.filter(provider => provider.supportsMobile)
      : this.allProviders.filter(provider => provider.supportsDesktop);
  }

  public get isMobile(): boolean {
    return this.headerStore.isMobile;
  }

  // How make link on coinbase deeplink https://github.com/walletlink/walletlink/issues/128
  public readonly coinbaseDeeplink = 'https://go.cb-w.com/cDgO1V5aDlb';

  public readonly shouldRenderAsLink = (provider: WALLET_NAME): boolean => {
    return this.isMobile && provider === WALLET_NAME.COIN_BASE;
  };

  public readonly rulesCheckbox = new FormControl<boolean>(this.getStorageValue());

  public enableWallets$ = this.rulesCheckbox.valueChanges.pipe(
    startWith(this.rulesCheckbox.value),
    tap(value => this.storeService.setItem('RUBIC_AGREEMENT_WITH_RULES_V1', value))
  );

  public readonly modalDirection: 'column' | 'row';

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, WalletsModalOptions>,
    @Inject(WA_WINDOW) private readonly window: RubicWindow,
    private readonly authService: AuthService,
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef,
    private readonly browserService: BrowserService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly storeService: StoreService,
    private readonly iframeService: IframeService,
    private readonly modalService: ModalService,
    private readonly router: Router
  ) {
    this.allProviders = context.data?.providers
      ? PROVIDERS_LIST.filter(provider => context.data.providers.includes(provider.value))
      : PROVIDERS_LIST;

    const metamaskProviders = METAMASK_PROVIDERS.filter(provider =>
      this.allProviders.some(v => v.value === provider)
    );

    this.modalDirection =
      context.data?.direction || (this.router.url.includes('privacy') ? 'row' : 'column');

    if (metamaskProviders.length < 2) {
      this.showMetamaskModal = false;
      this.supportedMetamaskProvider = metamaskProviders[0];
      this.allProviders = this.allProviders.map(provider =>
        provider.value === this.supportedMetamaskProvider
          ? { ...provider, display: true }
          : provider
      );
    } else {
      this.showMetamaskModal = true;
    }
  }

  ngOnInit() {
    this.rulesCheckbox.patchValue(this.getStorageValue());

    if (!this.iframeService.isIframe) {
      if (this.browserService.currentBrowser === BROWSER.METAMASK) {
        this.connectProvider(WALLET_NAME.METAMASK);
        return;
      }

      if (this.browserService.currentBrowser === BROWSER.COINBASE) {
        this.connectProvider(WALLET_NAME.COIN_BASE);
      }
    }
  }

  private getStorageValue(): boolean {
    return this.storeService.getItem('RUBIC_AGREEMENT_WITH_RULES_V1') || false;
  }

  private async deepLinkRedirectIfSupported(provider: WALLET_NAME): Promise<boolean> {
    const deepLinkFn = WALLETS_DEEP_LINK_MAPPING[provider];

    if (deepLinkFn) {
      const deepLink = deepLinkFn(this.window);
      this.window.location.assign(deepLink);
      return true;
    }
    return false;
  }

  public async connectProvider(providerName: WALLET_NAME): Promise<void> {
    if (this.rulesCheckbox.value) {
      let provider = providerName;

      const availableMultichainProviders = Object.keys(MULTICHAIN_OPTIONS_MAPPING);
      if (availableMultichainProviders.includes(provider)) {
        provider = await this.getMultichainWalletBasedOnNetwork(provider);
        if (!provider) {
          return;
        }
      }

      this.gtmService.fireClickOnWalletProviderEvent(provider);

      if (this.browserService.currentBrowser === BROWSER.MOBILE) {
        const redirected = await this.deepLinkRedirectIfSupported(provider);
        if (redirected) {
          return;
        }
      }

      this.headerStore.setWalletsLoadingStatus(true);

      const connectionTime = 15_000;

      await firstValueFrom(
        from(this.authService.connectWallet({ walletName: provider })).pipe(
          timeout(connectionTime),
          catchError(() => {
            this.headerStore.setWalletsLoadingStatus(false);
            return of(`Request timed out after: ${connectionTime}`);
          })
        )
      );

      this.close();
    }
  }

  public close(): void {
    this.headerStore.setWalletsLoadingStatus(false);
    this.context.completeWith();
  }

  public async getMultichainWalletBasedOnNetwork(
    walletName: WALLET_NAME
  ): Promise<WALLET_NAME | null> {
    try {
      if (walletName === WALLET_NAME.METAMASK && !this.showMetamaskModal) {
        return this.supportedMetamaskProvider;
      }
      const splitted = this.window.location.pathname.split('/');
      const privateWalletName = splitted[splitted.length - 1] as PrivateProviderUrl;
      const walletsToHide: WALLET_NAME[] = WALLETS_TO_HIDE[privateWalletName]
        ? WALLETS_TO_HIDE[privateWalletName]
        : [];
      return this.modalService.openMultichainWalletModal(walletName, walletsToHide);
    } catch {
      return null;
    }
  }
}

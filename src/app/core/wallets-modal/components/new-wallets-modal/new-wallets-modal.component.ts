import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { tuiIsEdge, tuiIsEdgeOlderThan, tuiIsFirefox } from '@taiga-ui/cdk';
import { WalletProvider } from '../wallets-modal/models/types';
import { WALLET_NAME } from '../wallets-modal/models/wallet-name';
import { AsyncPipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  from,
  of,
  startWith,
  tap,
  timeout
} from 'rxjs';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { WalletsModalOptions } from '../wallets-modal/models/wallets-modal-options';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { USER_AGENT, WINDOW } from '@ng-web-apis/common';
import { AuthService } from '@app/core/services/auth/auth.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { BrowserService } from '@app/core/services/browser/browser.service';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';
import { StoreService } from '@app/core/services/store/store.service';
import { IframeService } from '@app/core/services/iframe-service/iframe.service';
import { ModalService } from '@app/core/modals/services/modal.service';
import { PROVIDERS_LIST } from '../wallets-modal/models/providers';
import { BROWSER } from '@app/shared/models/browser/browser';
import { WALLETS_DEEP_LINK_MAPPING } from '../wallets-modal/constants/wallets-deep-link-mapping';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WalletFilterConfig } from './models/models';
import { CHAIN_TYPES_FILTERS } from './components/chain-types-list/constants/chain-type-filters';

@Component({
  selector: 'app-new-wallets-modal',
  templateUrl: './new-wallets-modal.component.html',
  styleUrls: ['./new-wallets-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewWalletsModalComponent {
  public readonly walletsLoading$ = this.headerStore.getWalletsLoadingStatus();

  private readonly allProviders: ReadonlyArray<WalletProvider>;

  private readonly mobileDisplayStatus$ = this.headerStore.getMobileDisplayStatus();

  public get isChromium(): boolean {
    if (tuiIsEdge(this.userAgent) || tuiIsEdgeOlderThan(13, this.userAgent)) {
      return false;
    }
    return !tuiIsFirefox(this.userAgent);
  }

  public get providers(): ReadonlyArray<WalletProvider> {
    const isChromiumProviders = this.isChromium
      ? this.allProviders
      : this.allProviders.filter(provider => provider.value !== WALLET_NAME.BITGET);

    return this.isMobile
      ? isChromiumProviders.filter(provider => provider.supportsMobile)
      : isChromiumProviders.filter(provider => provider.supportsDesktop);
  }

  public get isMobile(): boolean {
    return new AsyncPipe(this.cdr).transform(this.mobileDisplayStatus$);
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

  public readonly activeWallets$ = this.walletConnectorService.activeWallets$;

  private readonly _selectedFilter$ = new BehaviorSubject<WalletFilterConfig>(
    CHAIN_TYPES_FILTERS.ALL
  );

  public readonly selectedFilter$ = this._selectedFilter$.asObservable();

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, WalletsModalOptions>,
    @Inject(WINDOW) private readonly window: RubicWindow,
    @Inject(USER_AGENT) private readonly userAgent: string,
    private readonly authService: AuthService,
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef,
    private readonly browserService: BrowserService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly storeService: StoreService,
    private readonly iframeService: IframeService,
    private readonly modalService: ModalService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.allProviders = context.data?.providers
      ? PROVIDERS_LIST.filter(provider => context.data.providers.includes(provider.value))
      : PROVIDERS_LIST;
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
      if (provider === WALLET_NAME.METAMASK) {
        provider = await this.getMetamaskBasedOnNetwork();
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

  public async getMetamaskBasedOnNetwork(): Promise<WALLET_NAME | null> {
    try {
      return this.modalService.openMetamaskModal();
    } catch {
      return null;
    }
  }

  public selectFilter(filter: WalletFilterConfig): void {
    this._selectedFilter$.next(filter);
  }
}

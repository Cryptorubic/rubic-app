import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { WALLET_NAME } from '../wallets-modal/models/wallet-name';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  from,
  map,
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
import { BROWSER } from '@app/shared/models/browser/browser';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WalletConfigUI, WalletFilterConfig } from './models/models';
import { CHAIN_TYPES_FILTERS } from './constants/chain-type-filters';
import { WALLETS_LIST } from './constants/wallets';
import { TuiDestroyService, tuiIsEdge, tuiIsEdgeOlderThan, tuiIsFirefox } from '@taiga-ui/cdk';
import { AsyncPipe } from '@angular/common';
import { WALLETS_DEEP_LINK_MAPPING } from './constants/wallets-deep-link-mapping';
import { METAMASK_PROVIDERS } from '../wallets-modal/models/metamask-providers';

@Component({
  selector: 'app-new-wallets-modal',
  templateUrl: './new-wallets-modal.component.html',
  styleUrls: ['./new-wallets-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class NewWalletsModalComponent {
  public readonly walletsLoading$ = this.headerStore.getWalletsLoadingStatus();

  private readonly allWallets: ReadonlyArray<WalletConfigUI>;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  private readonly showMetamaskModal: boolean;

  private readonly supportedMetamaskProvider: WALLET_NAME;

  public get isChromium(): boolean {
    if (tuiIsEdge(this.userAgent) || tuiIsEdgeOlderThan(13, this.userAgent)) {
      return false;
    }
    return !tuiIsFirefox(this.userAgent);
  }

  public get providers(): ReadonlyArray<WalletConfigUI> {
    const isChromiumProviders = this.isChromium
      ? this.allWallets
      : this.allWallets.filter(provider => provider.value !== WALLET_NAME.BITGET);

    return this.isMobile
      ? isChromiumProviders.filter(provider => provider.supportsMobile)
      : isChromiumProviders.filter(provider => provider.supportsDesktop);
  }

  public get isMobile(): boolean {
    return new AsyncPipe(this.cdr).transform(this.isMobile$);
  }

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

  public readonly visibleWallets$ = this.selectedFilter$.pipe(
    map(selectedFilter => {
      return this.providers
        .filter(wallet => selectedFilter.filterFunc(wallet.value))
        .sort((a, _) => {
          const isActive = this.walletConnectorService.activeWallets.some(
            activeWallet => activeWallet.walletName === a.value
          );
          return isActive ? -1 : 1;
        });
    }),
    startWith([])
  );

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
    this.allWallets = context.data?.providers
      ? WALLETS_LIST.filter(provider => context.data.providers.includes(provider.value))
      : WALLETS_LIST;

    const metamaskProviders = METAMASK_PROVIDERS.filter(provider =>
      this.allWallets.some(v => v.value === provider)
    );

    if (metamaskProviders.length < 2) {
      this.showMetamaskModal = false;
      this.supportedMetamaskProvider = metamaskProviders[0];
      this.allWallets = this.allWallets.map(provider =>
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

    //@TODO_530 автоматически подключает кошелек ММ на мобиле, теперь это работает плохо,
    // так как есть два отдельных Метамаска для Соланы и ЕВМ, нужно удалить этот код

    // if (!this.iframeService.isIframe) {
    //   if (this.browserService.currentBrowser === BROWSER.METAMASK) {
    //     this.connectWallet(WALLET_NAME.METAMASK);
    //     return;
    //   }

    //   if (this.browserService.currentBrowser === BROWSER.COINBASE) {
    //     this.connectWallet(WALLET_NAME.COIN_BASE);
    //   }
    // }
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

  public async connectWallet(walletName: WALLET_NAME): Promise<void> {
    if (!this.rulesCheckbox.value) return;
    this.gtmService.fireClickOnWalletProviderEvent(walletName);

    if (this.browserService.currentBrowser === BROWSER.MOBILE) {
      const redirected = await this.deepLinkRedirectIfSupported(walletName);
      if (redirected) return;
    }

    this.headerStore.setWalletsLoadingStatus(true);
    const connectionTime = 15_000;
    await firstValueFrom(
      from(this.authService.connectWallet({ walletName })).pipe(
        timeout(connectionTime),
        catchError(() => {
          this.headerStore.setWalletsLoadingStatus(false);
          return of(`Request timed out after: ${connectionTime}`);
        })
      )
    );

    this.close();
  }

  public logoutWallet(walletName: WALLET_NAME): void {
    this.walletConnectorService.deactivate(walletName);
    this.close();
  }

  public close(): void {
    this.headerStore.setWalletsLoadingStatus(false);
    this.context.completeWith();
  }

  // @TODO_530 remove if not needed
  public async getMetamaskBasedOnNetwork(): Promise<WALLET_NAME | null> {
    try {
      if (!this.showMetamaskModal) return this.supportedMetamaskProvider;
      return this.modalService.openMetamaskModal();
    } catch {
      return null;
    }
  }

  public selectFilter(filter: WalletFilterConfig): void {
    this._selectedFilter$.next(filter);
  }
}

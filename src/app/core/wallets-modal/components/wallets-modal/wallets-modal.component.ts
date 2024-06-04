import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnInit
} from '@angular/core';
import { USER_AGENT, WINDOW } from '@ng-web-apis/common';
import { AsyncPipe } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { BrowserService } from 'src/app/core/services/browser/browser.service';
import { BROWSER } from '@shared/models/browser/browser';
import { WalletProvider } from '@core/wallets-modal/components/wallets-modal/models/types';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { PROVIDERS_LIST } from '@core/wallets-modal/components/wallets-modal/models/providers';
import { RubicWindow } from '@shared/utils/rubic-window';
import { ModalService } from '@app/core/modals/services/modal.service';
import { firstValueFrom, from, of, startWith } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { TuiDestroyService, tuiIsEdge, tuiIsEdgeOlderThan, tuiIsFirefox } from '@taiga-ui/cdk';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { FormControl } from '@angular/forms';
import { StoreService } from '@core/services/store/store.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { blockchainId } from 'rubic-sdk';

@Component({
  selector: 'app-wallets-modal',
  templateUrl: './wallets-modal.component.html',
  styleUrls: ['./wallets-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService, SwapsFormService]
})
export class WalletsModalComponent implements OnInit {
  public readonly walletsLoading$ = this.headerStore.getWalletsLoadingStatus();

  private readonly allProviders = PROVIDERS_LIST;

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
      : this.allProviders.filter(provider => provider.value !== WALLET_NAME.BITKEEP);

    return this.isMobile
      ? isChromiumProviders.filter(provider => provider.supportsMobile)
      : isChromiumProviders.filter(provider => provider.supportsDesktop);
  }

  public get isMobile(): boolean {
    return new AsyncPipe(this.cdr).transform(this.mobileDisplayStatus$);
  }

  // How make link on coinbase deeplink https://github.com/walletlink/walletlink/issues/128
  public readonly coinbaseDeeplink = 'https://go.cb-w.com/cDgO1V5aDlb';

  private readonly metamaskAppLink = 'https://metamask.app.link/dapp/';

  public readonly shouldRenderAsLink = (provider: WALLET_NAME): boolean => {
    return this.isMobile && provider === WALLET_NAME.WALLET_LINK;
  };

  public readonly rulesCheckbox = new FormControl<boolean>(this.getStorageValue());

  public enableWallets$ = this.rulesCheckbox.valueChanges.pipe(
    startWith(this.rulesCheckbox.value),
    tap(value => this.storeService.setItem('RUBIC_AGREEMENT_WITH_RULES_V1', value))
  );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<void>,
    private readonly dialogService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(WINDOW) private readonly window: RubicWindow,
    @Inject(USER_AGENT) private readonly userAgent: string,
    private readonly translateService: TranslateService,
    private readonly authService: AuthService,
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef,
    private readonly browserService: BrowserService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly storeService: StoreService,
    private readonly swapFormService: SwapsFormService
  ) {}

  ngOnInit() {
    this.rulesCheckbox.patchValue(this.getStorageValue());

    if (this.browserService.currentBrowser === BROWSER.METAMASK) {
      this.connectProvider(WALLET_NAME.METAMASK);
      return;
    }

    if (this.browserService.currentBrowser === BROWSER.COINBASE) {
      this.connectProvider(WALLET_NAME.WALLET_LINK);
    }
  }

  private getStorageValue(): boolean {
    return this.storeService.getItem('RUBIC_AGREEMENT_WITH_RULES_V1') || false;
  }

  private async deepLinkRedirectIfSupported(provider: WALLET_NAME): Promise<boolean> {
    switch (provider) {
      case WALLET_NAME.METAMASK:
        await this.redirectToMetamaskBrowser();
        return true;
      case WALLET_NAME.WALLET_LINK:
        this.redirectToCoinbaseBrowser();
        return true;
      default:
        return false;
    }
  }

  private async redirectToMetamaskBrowser(): Promise<void> {
    const queryUrl = `${this.window.location.host}${this.window.location.search}`;
    this.window.location.assign(`${this.metamaskAppLink}${queryUrl}`);
  }

  private redirectToCoinbaseBrowser(): void {
    this.window.location.assign(this.coinbaseDeeplink);
  }

  public async connectProvider(provider: WALLET_NAME): Promise<void> {
    if (this.rulesCheckbox.value) {
      this.gtmService.fireClickOnWalletProviderEvent(provider);

      if (this.browserService.currentBrowser === BROWSER.MOBILE) {
        const redirected = await this.deepLinkRedirectIfSupported(provider);
        if (redirected) {
          return;
        }
      }

      this.headerStore.setWalletsLoadingStatus(true);

      const connectionTime = 15_000;
      const chainId = blockchainId[this.swapFormService.inputValue.fromToken?.blockchain] || 1;

      await firstValueFrom(
        from(this.authService.connectWallet({ walletName: provider, chainId })).pipe(
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

  protected readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;
}

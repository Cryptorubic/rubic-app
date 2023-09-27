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
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { CoinbaseConfirmModalComponent } from 'src/app/core/wallets-modal/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { blockchainId, BlockchainName } from 'rubic-sdk';
import { WINDOW } from '@ng-web-apis/common';
import { BrowserService } from 'src/app/core/services/browser/browser.service';
import { BROWSER } from '@shared/models/browser/browser';
import { WalletProvider } from '@core/wallets-modal/components/wallets-modal/models/types';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { PROVIDERS_LIST } from '@core/wallets-modal/components/wallets-modal/models/providers';
import { RubicWindow } from '@shared/utils/rubic-window';
import { ModalService } from '@app/core/modals/services/modal.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { firstValueFrom, from, of } from 'rxjs';
import { catchError, switchMap, timeout } from 'rxjs/operators';
import { tuiIsEdge, tuiIsEdgeOlderThan, tuiIsFirefox } from '@taiga-ui/cdk';

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

    return (
      this.isMobile &&
      isChromiumProviders.filter(
        provider => !provider.desktopOnly && provider.value !== WALLET_NAME.BITKEEP
      )
    );
  }

  public get isMobile(): boolean {
    return new AsyncPipe(this.cdr).transform(this.mobileDisplayStatus$);
  }

  // How make link on coinbase deeplink https://github.com/walletlink/walletlink/issues/128
  public readonly coinbaseDeeplink = 'https://go.cb-w.com/cDgO1V5aDlb';

  private readonly metamaskAppLink = 'https://metamask.app.link/dapp/';

  public readonly shouldRenderAsLink = (provider: WALLET_NAME): boolean => {
    return provider === WALLET_NAME.WALLET_LINK;
  };

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<void>,
    private readonly dialogService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(WINDOW) private readonly window: RubicWindow,
    @Inject(USER_AGENT) private readonly userAgent: string,
    private readonly translateService: TranslateService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef,
    private readonly browserService: BrowserService,
    private readonly queryParamsService: QueryParamsService
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
    this.window.location.assign(`https://metamask.app.link/dapp/${queryUrl}`);
    await new Promise<void>(resolve => {
      setTimeout(() => {
        this.window.location.assign(`${this.metamaskAppLink}${queryUrl}`);
      }, 5000);
      resolve();
    });
  }

  private redirectToCoinbaseBrowser(): void {
    this.window.location.assign(this.coinbaseDeeplink);
  }

  public async connectProvider(provider: WALLET_NAME): Promise<void> {
    if (this.browserService.currentBrowser === BROWSER.MOBILE) {
      const redirected = await this.deepLinkRedirectIfSupported(provider);
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
        .showDialog<CoinbaseConfirmModalComponent, BlockchainName>(
          CoinbaseConfirmModalComponent,
          {
            dismissible: true,
            label: this.translateService.instant('modals.coinbaseSelectNetworkModal.title'),
            size: 'm',
            fitContent: true
          },
          this.injector
        )
        .pipe(
          switchMap(blockchainName => {
            if (blockchainName) {
              this.close();
              return this.authService.connectWallet({
                walletName: provider,
                chainId: blockchainId[blockchainName]
              });
            }
            return of(null);
          }),
          catchError(() => {
            return of(null);
          })
        )
        .subscribe(() => this.headerStore.setWalletsLoadingStatus(false));
      return;
    }

    try {
      const connectionTime = 15_000;
      await firstValueFrom(
        from(this.authService.connectWallet({ walletName: provider })).pipe(
          timeout(connectionTime),
          catchError(() => of(`Request timed out after: ${connectionTime}`))
        )
      );
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
}

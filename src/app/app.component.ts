import { AfterViewInit, Component, Inject, isDevMode } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { DOCUMENT } from '@angular/common';
import { PlatformConfigurationService } from '@app/core/services/backend/platform-configuration/platform-configuration.service';
import { QueryParams } from '@core/services/query-params/models/query-params';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { isSupportedLanguage } from '@shared/models/languages/supported-languages';
import { catchError, delay, first, map } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { IframeService } from '@core/services/iframe-service/iframe.service';
import { WalletConnectorService } from './core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TokensStoreService } from './core/services/tokens/tokens-store.service';
import { BalanceLoadingStateService } from './core/services/tokens/balance-loading-state.service';
import { AssetsSelectorStateService } from './features/trade/components/assets-selector/services/assets-selector-state/assets-selector-state.service';
import { TOKEN_FILTERS } from './features/trade/components/assets-selector/models/token-filters';
import { TradePageService } from './features/trade/services/trade-page/trade-page.service';
import { BalanceLoadingAssetData } from './core/services/tokens/models/balance-loading-types';
import { TokensNetworkService } from './core/services/tokens/tokens-network.service';
import { switchIif } from './shared/utils/utils';
import { CHAIN_TYPE } from '@cryptorubic/core';
import { WALLET_NAME } from './core/wallets-modal/components/wallets-modal/models/wallet-name';
import { SdkLoaderService } from './core/services/sdk/sdk-loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  public isBackendAvailable: boolean;

  public useLargeIframe = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly queryParamsService: QueryParamsService,
    @Inject(WINDOW) private window: RubicWindow,
    private readonly activatedRoute: ActivatedRoute,
    private readonly iframeService: IframeService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly balanceLoadingStateService: BalanceLoadingStateService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly tradePageService: TradePageService,
    private readonly tokensNetworkService: TokensNetworkService,
    private readonly sdkLoaderService: SdkLoaderService
  ) {
    this.printTimestamp();
    this.setupLanguage();

    this.initApp();
    this.subscribeOnWalletChanges();
    this.tokensNetworkService.setupSubscriptions();
  }

  ngAfterViewInit() {
    this.setupIframeSettings();
  }

  private subscribeOnWalletChanges(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        switchIif(
          () =>
            this.walletConnectorService.chainType === CHAIN_TYPE.SOLANA &&
            this.walletConnectorService.provider.walletName === WALLET_NAME.BACKPACK,
          (address: string) => of(address).pipe(delay(1_000)),
          (address: string) => of(address)
        )
      )
      .subscribe(userAddress => {
        if (userAddress) this.sdkLoaderService.onAddressChange(userAddress);

        this.balanceLoadingStateService.resetBalanceCalculatingStatuses();
        this.tokensStoreService.startBalanceCalculating(this.assetsSelectorStateService.assetType);

        const allTokensAssetData: BalanceLoadingAssetData = {
          assetType: 'allChains',
          tokenFilter: TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS
        };

        // load ALL_CHAINS_ALL_TOKENS assets in background if token's selector closed
        // and if ALL_CHAINS_ALL_TOKENS balances not loaded yet
        if (
          userAddress &&
          this.tradePageService.formContent === 'form' &&
          !this.balanceLoadingStateService.isBalanceCalculated(allTokensAssetData)
        ) {
          this.tokensStoreService.startBalanceCalculating('allChains', {
            allChainsFilterToPatch: TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS
          });
        }
      });
  }

  /**
   * Setups list of languages and current language.
   */
  private setupLanguage(): void {
    let userRegionLanguage = navigator.language?.split('-')[0];
    userRegionLanguage = isSupportedLanguage(userRegionLanguage) ? userRegionLanguage : 'en';
    const lng = this.cookieService.get('lng') || userRegionLanguage;
    this.translateService.setDefaultLang(lng);
    this.translateService.use(lng);
  }

  /**
   * Log current dev build timestamp.
   * @private
   */
  private printTimestamp(): void {
    if (isDevMode()) {
      // @ts-ignore
      import('@app/timestamp')
        .then(data => console.debug(`It's a development build, timestamp: ${data.timestamp}`))
        .catch(() => {
          console.debug('timestamp file is not found');
        });
    }
  }

  /**
   * Setups settings for app in iframe.
   */
  private setupIframeSettings(): void {
    if (this.iframeService.isIframe) {
      this.removeLiveChatInIframe();
    }
    this.queryParamsService.queryParams$
      .pipe(first(queryParams => Boolean(Object.keys(queryParams).length)))
      .subscribe(params => {
        this.useLargeIframe = params.useLargeIframe === 'true';
      });
  }

  private removeLiveChatInIframe(): void {
    const observer = new MutationObserver(() => {
      const liveChat = this.document.getElementById('chat-widget-container');
      if (liveChat) {
        liveChat.remove();
        observer.disconnect();
      }
    });
    observer.observe(this.document.body, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: false
    });
  }

  /**
   * Waits for all initializing observables to complete.
   */
  private initApp(): void {
    forkJoin([this.loadPlatformConfig(), this.initQueryParamsSubscription()]).subscribe(
      ([isBackendAvailable]) => {
        this.isBackendAvailable = isBackendAvailable;
        document.getElementById('loader')?.classList.add('disabled');
        setTimeout(() => document.getElementById('loader')?.remove(), 400); /* ios safari */
      }
    );
  }

  /**
   * Inits site query params subscription.
   */
  private initQueryParamsSubscription(): Observable<void> {
    const questionMarkIndex = this.window.location.href.indexOf('?');
    if (questionMarkIndex === -1 || questionMarkIndex === this.window.location.href.length - 1) {
      return of(null);
    }

    return this.activatedRoute.queryParams.pipe(
      first(queryParams => Boolean(Object.keys(queryParams).length)),
      map((queryParams: QueryParams) => {
        this.queryParamsService.setupQueryParams({
          ...queryParams,
          ...(queryParams?.from && { from: queryParams.from }),
          ...(queryParams?.to && { to: queryParams.to })
        });
        if (queryParams.hideUnusedUI) {
          this.setupUISettings(queryParams);
        }
      }),
      catchError(() => of(null))
    );
  }

  private setupUISettings(queryParams: QueryParams): void {
    const hideUI = queryParams.hideUnusedUI === 'true';

    if (hideUI) {
      this.document.body.classList.add('hide-unused-ui');
    }
  }

  /**
   * Loads platform config and checks is server active.
   */
  private loadPlatformConfig(): Observable<boolean> {
    return this.platformConfigurationService.loadPlatformConfig();
  }
}

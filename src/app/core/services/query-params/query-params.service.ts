import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from 'rubic-sdk';
import { BehaviorSubject, skip } from 'rxjs';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { AdditionalTokens, QueryParams, QuerySlippage } from './models/query-params';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { isSupportedLanguage } from '@shared/models/languages/supported-languages';
import { BlockchainName } from 'rubic-sdk';
import { HeaderStore } from '@core/header/services/header.store';
import { WINDOW } from '@ng-web-apis/common';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  public currentQueryParams: QueryParams;

  private readonly _tokensSelectionDisabled$ = new BehaviorSubject<[boolean, boolean]>([
    false,
    false
  ]);

  public tokensSelectionDisabled$ = this._tokensSelectionDisabled$.asObservable();

  public slippage: QuerySlippage;

  public get noFrameLink(): string {
    const urlTree = this.router.parseUrl(this.router.url);
    delete urlTree.queryParams.iframe;
    return urlTree.toString();
  }

  public hideUnusedUI: boolean;

  public disabledProviders: CrossChainTradeType[] | undefined;

  public enabledProviders: CrossChainTradeType[] | undefined;

  public enabledBlockchains: BlockchainName[];

  public backgroundColor: string;

  private readonly _queryParams$ = new BehaviorSubject<QueryParams>(undefined);

  public readonly queryParams$ = this._queryParams$.asObservable();

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly tokensService: TokensService,
    @Inject(DOCUMENT) private document: Document,
    private readonly router: Router,
    private readonly swapFormService: SwapFormService,
    private readonly iframeService: IframeService,
    private readonly themeService: ThemeService,
    private readonly translateService: TranslateService,
    private readonly settingsService: SettingsService,
    @Inject(WINDOW) private readonly window: Window
  ) {
    this.swapFormService.inputValue$.pipe(skip(1)).subscribe(value => {
      this.setQueryParams({
        ...(value.fromAsset?.symbol && { from: value.fromAsset.symbol }),
        ...(value.toToken?.symbol && { to: value.toToken.symbol }),
        ...(value.fromAssetType && { fromChain: value.fromAssetType }),
        ...(value.toBlockchain && { toChain: value.toBlockchain }),
        ...(value.fromAmount &&
          !value.fromAmount?.eq(0) &&
          value.fromAmount?.isFinite() && { amount: value.fromAmount.toFixed() })
      });
    });
  }

  public async setupQueryParams(queryParams: QueryParams): Promise<void> {
    if (queryParams && Object.keys(queryParams).length !== 0) {
      this.hideUnusedUI = queryParams.hideUnusedUI === 'true';
      this.headerStore.forceDesktopResolution = queryParams.isDesktop;
      this.setIframeInfo(queryParams);

      if (queryParams.enabledProviders || queryParams.enabledBlockchains) {
        this.setEnabledProviders(queryParams.enabledProviders);
        this.setDisabledProviders(queryParams.enabledProviders);
        this.enabledBlockchains = queryParams.enabledBlockchains;
      }

      this._queryParams$.next(queryParams);
    }
  }

  public setQueryParams(params: Partial<QueryParams>): void {
    this.currentQueryParams = {
      ...this.currentQueryParams,
      ...params
    };
    this.navigate();
  }

  private setDisabledProviders(enabledProviders: string[]): void {
    this.disabledProviders = Object.values(CROSS_CHAIN_TRADE_TYPE).filter(
      provider => !enabledProviders.includes(provider.toLowerCase())
    );
  }

  private setEnabledProviders(enabledProviders: string[]): void {
    this.enabledProviders = Object.values(CROSS_CHAIN_TRADE_TYPE).filter(provider =>
      enabledProviders.includes(provider.toLowerCase())
    );
  }

  private navigate(): void {
    this.router.navigate([], {
      queryParams: this.currentQueryParams,
      queryParamsHandling: 'merge'
    });
  }

  private setIframeInfo(queryParams: QueryParams): void {
    if (queryParams.hideUnusedUI) {
      this.setLanguage(queryParams);
      this.setHideSelectionStatus(queryParams);
    }

    if (!queryParams.hasOwnProperty('iframe')) {
      return;
    }

    const { iframe } = queryParams;
    if (iframe !== 'vertical' && iframe !== 'horizontal') {
      return;
    }

    this.iframeService.setIframeInfo({
      iframeAppearance: queryParams.iframe,
      device: queryParams.device,
      fee: queryParams.fee ? parseFloat(queryParams.fee) : undefined,
      feeTarget: queryParams.feeTarget,
      promoCode: queryParams.promoCode,
      tokenSearch: queryParams.tokenSearch === 'true',
      rubicLink: queryParams.rubicLink === undefined || queryParams.rubicLink === 'true'
    });

    this.setBackgroundStatus(queryParams);
    this.setHideSelectionStatus(queryParams);
    this.setSlippage(queryParams);
    this.setAdditionalIframeTokens(queryParams);
    this.setThemeStatus(queryParams);
    this.setLanguage(queryParams);
  }

  private setBackgroundStatus(queryParams: QueryParams): void {
    if (!this.iframeService.isIframe) {
      return;
    }

    const { background } = queryParams;
    if (this.isBackgroundValid(background)) {
      this.backgroundColor = background;
      return;
    }
    this.document.body.classList.add('default-iframe-background');
  }

  private setHideSelectionStatus(queryParams: QueryParams): void {
    if (!this.iframeService.isIframe && queryParams.hideUnusedUI !== 'true') {
      return;
    }

    const tokensSelectionDisabled: [boolean, boolean] = [
      queryParams.hideSelectionFrom === 'true',
      queryParams.hideSelectionTo === 'true'
    ];

    if (tokensSelectionDisabled.includes(true)) {
      this._tokensSelectionDisabled$.next(tokensSelectionDisabled);
    }
  }

  private setSlippage(queryParams: QueryParams): void {
    if (!this.iframeService.isIframe) {
      return;
    }

    this.slippage = {
      slippageIt: queryParams.slippageIt ? parseFloat(queryParams.slippageIt) : null,
      slippageCcr: queryParams.slippageCcr ? parseFloat(queryParams.slippageCcr) : null
    };

    this.settingsService.changeDefaultSlippage(this.slippage);
  }

  private setAdditionalIframeTokens(queryParams: QueryParams): void {
    if (!this.iframeService.isIframe) {
      return;
    }

    const tokensFilterKeys: Readonly<Array<keyof QueryParams>> = [
      'eth_tokens',
      'bsc_tokens',
      'polygon_tokens',
      'harmony_tokens',
      'avalanche_tokens',
      'fantom_tokens',
      'moonriver_tokens'
    ] as const;
    const tokensQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([key]) =>
        tokensFilterKeys.includes(key as AdditionalTokens)
      )
    );

    if (Object.keys(tokensQueryParams).length !== 0) {
      this.tokensService.tokensRequestParameters = tokensQueryParams;
    }
  }

  private setThemeStatus(queryParams: QueryParams): void {
    if (!this.iframeService.isIframe) {
      return;
    }

    const { theme } = queryParams;
    if (theme && (theme === 'dark' || theme === 'light')) {
      this.themeService.setTheme(theme);
    }
  }

  private setLanguage(queryParams: QueryParams): void {
    const language = isSupportedLanguage(queryParams.language) ? queryParams.language : 'en';
    this.translateService.use(language);
  }

  private isBackgroundValid(stringToTest: string): boolean {
    if (stringToTest === '') {
      return false;
    }
    if (stringToTest === 'inherit') {
      return false;
    }
    if (stringToTest === 'transparent') {
      return false;
    }

    const image = document.createElement('img');
    image.style.background = 'rgb(0, 0, 0)';
    image.style.background = stringToTest;
    if (image.style.background !== 'rgb(0, 0, 0)') {
      return true;
    }
    image.style.background = 'rgb(255, 255, 255)';
    image.style.background = stringToTest;
    return image.style.background !== 'rgb(255, 255, 255)';
  }

  /**
   * Clears all near query params.
   */
  private clearNearParams(): void {
    this.setQueryParams({
      errorCode: null,
      errorMessage: null,
      toAmount: null,
      transactionHashes: null,
      walletAddress: null,
      swap_type: null,
      nearLogin: null,
      account_id: null,
      all_keys: null,
      public_key: null
    });
  }

  public getUrlSearchParam(key: string): string {
    return new URLSearchParams(this.window.location.search).get(key) || undefined;
  }
}

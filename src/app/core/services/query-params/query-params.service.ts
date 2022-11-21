import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { List } from 'immutable';
import {
  BlockchainsInfo,
  CHAIN_TYPE,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  EvmWeb3Pure,
  Web3Pure
} from 'rubic-sdk';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { SwapFormService } from 'src/app/features/swaps/core/services/swap-form-service/swap-form.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { SwapsService } from 'src/app/features/swaps/core/services/swaps-service/swaps.service';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { compareAddresses, switchIif } from 'src/app/shared/utils/utils';
import { AdditionalTokens, QueryParams, QuerySlippage } from './models/query-params';
import { GoogleTagManagerService } from 'src/app/core/services/google-tag-manager/google-tag-manager.service';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { isSupportedLanguage } from '@shared/models/languages/supported-languages';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { HeaderStore } from '@core/header/services/header.store';
import { WINDOW } from '@ng-web-apis/common';

const DEFAULT_PARAMETERS = {
  swap: {
    fromChain: BLOCKCHAIN_NAME.ETHEREUM,
    toChain: BLOCKCHAIN_NAME.ETHEREUM,
    from: {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BNB',
      [BLOCKCHAIN_NAME.POLYGON]: 'MATIC',
      [BLOCKCHAIN_NAME.HARMONY]: 'ONE',
      [BLOCKCHAIN_NAME.AVALANCHE]: 'AVAX',
      [BLOCKCHAIN_NAME.MOONRIVER]: 'MOVR',
      [BLOCKCHAIN_NAME.ARBITRUM]: 'AETH',
      [BLOCKCHAIN_NAME.AURORA]: 'aETH',
      [BLOCKCHAIN_NAME.TELOS]: 'TLOS'
    },
    to: {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'RBC',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BRBC'
    },
    amount: '1'
  }
};

type DefaultParametersFrom = keyof typeof DEFAULT_PARAMETERS.swap.from;
type DefaultParametersTo = keyof typeof DEFAULT_PARAMETERS.swap.to;

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

  public screenWidth: number;

  public backgroundColor: string;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly tokensService: TokensService,
    @Inject(DOCUMENT) private document: Document,
    private readonly router: Router,
    private readonly swapFormService: SwapFormService,
    private readonly swapsService: SwapsService,
    private readonly iframeService: IframeService,
    private readonly themeService: ThemeService,
    private readonly translateService: TranslateService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly settingsService: SettingsService,
    @Inject(WINDOW) private readonly window: Window
  ) {
    this.swapFormService.inputValueChanges.subscribe(value => {
      this.setQueryParams({
        ...(value.fromToken?.symbol && { from: value.fromToken.symbol }),
        ...(value.toToken?.symbol && { to: value.toToken.symbol }),
        ...(value.fromBlockchain && { fromChain: value.fromBlockchain }),
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

      const route = this.router.url.split('?')[0].substr(1);
      const hasParams = Object.keys(queryParams).length !== 0;
      if (hasParams && route === '') {
        this.initiateTradesParams(queryParams);
      }
    }
  }

  public setQueryParams(params: Partial<QueryParams>): void {
    this.currentQueryParams = {
      ...this.currentQueryParams,
      ...params
    };
    this.navigate();
  }

  private initiateTradesParams(params: QueryParams): void {
    this.swapsService.availableTokens$
      .pipe(
        first(tokens => tokens?.size > 0),
        mergeMap(tokens =>
          this.getProtectedSwapParams(params).pipe(
            map(protectedParams => ({ tokens, protectedParams }))
          )
        ),
        mergeMap(({ tokens, protectedParams }) => {
          const fromBlockchain = protectedParams.fromChain;
          const toBlockchain = protectedParams.toChain;

          const findFromToken$ = this.getTokenBySymbolOrAddress(
            tokens,
            protectedParams?.from,
            fromBlockchain
          );
          const findToToken$ = this.getTokenBySymbolOrAddress(
            tokens,
            protectedParams?.to,
            toBlockchain
          );

          return forkJoin([findFromToken$, findToToken$]).pipe(
            map(([fromToken, toToken]) => ({
              fromToken,
              toToken,
              fromBlockchain,
              toBlockchain,
              protectedParams
            }))
          );
        })
      )
      .subscribe(({ fromToken, toToken, fromBlockchain, toBlockchain, protectedParams }) => {
        this.gtmService.needTrackFormEventsNow = false;
        this.swapFormService.input.patchValue({
          fromBlockchain,
          toBlockchain,
          ...(fromToken && { fromToken }),
          ...(toToken && { toToken }),
          ...(protectedParams.amount !== undefined && {
            fromAmount: new BigNumber(protectedParams.amount)
          })
        });
      });
  }

  private getProtectedSwapParams(queryParams: QueryParams): Observable<QueryParams> {
    const blockchainNames = Object.values(BLOCKCHAIN_NAME);
    const fromChain = blockchainNames.includes(queryParams?.fromChain)
      ? queryParams.fromChain
      : this.swapFormService.inputValue.fromBlockchain || DEFAULT_PARAMETERS.swap.fromChain;

    const toChain = blockchainNames.includes(queryParams?.toChain)
      ? queryParams.toChain
      : DEFAULT_PARAMETERS.swap.toChain;

    const newParams = {
      ...queryParams,
      fromChain,
      toChain,
      ...(queryParams.from && { from: queryParams.from }),
      ...(queryParams.to && { to: queryParams.to }),
      ...(queryParams.amount && { amount: queryParams.amount })
    };

    if (fromChain === toChain && newParams.from && newParams.from === newParams.to) {
      if (newParams.from === DEFAULT_PARAMETERS.swap.from[fromChain as DefaultParametersFrom]) {
        newParams.from = DEFAULT_PARAMETERS.swap.to[fromChain as DefaultParametersTo];
      } else {
        newParams.to = DEFAULT_PARAMETERS.swap.from[fromChain as DefaultParametersFrom];
      }
    }

    return of(newParams);
  }

  /**
   * Gets tokens by symbol or address.
   * @param tokens Tokens list to search.
   * @param token Tokens symbol or address.
   * @param chain Tokens chain.
   * @return Observable<TokenAmount> Founded token.
   */
  private getTokenBySymbolOrAddress(
    tokens: List<TokenAmount>,
    token: string,
    chain: BlockchainName
  ): Observable<TokenAmount> {
    if (!token) {
      return of(null);
    }

    const chainType = BlockchainsInfo.getChainType(chain);
    if (Web3Pure[chainType].isAddressCorrect(token)) {
      const address = chainType === CHAIN_TYPE.EVM ? EvmWeb3Pure.toChecksumAddress(token) : token;
      return this.searchTokenByAddress(tokens, address, chain);
    }
    return this.searchTokenBySymbol(tokens, token, chain);
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

  /**
   * Searches token by symbol.
   * @param tokens List of local tokens.
   * @param symbol Symbol to search.
   * @param chain Chain to search.
   * @return Observable<TokenAmount> Searched token.
   */
  private searchTokenBySymbol(
    tokens: List<TokenAmount>,
    symbol: string,
    chain: BlockchainName
  ): Observable<TokenAmount> {
    const similarTokens = tokens.filter(
      token =>
        token.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase() &&
        token.blockchain === chain
    );

    if (!similarTokens.size) {
      return this.tokensService.fetchQueryTokens(symbol, chain).pipe(
        map(foundTokens => {
          if (foundTokens?.size) {
            const token =
              foundTokens?.size > 1
                ? foundTokens.find(
                    el => el.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase()
                  )
                : foundTokens.first();
            const newToken = { ...token, amount: new BigNumber(NaN) } as TokenAmount;
            this.tokensService.addToken(newToken);
            return newToken;
          }
          return null;
        })
      );
    }

    return of(similarTokens.first());
  }

  /**
   * Searches token by address.
   * @param tokens List of local tokens.
   * @param address Address to search.
   * @param chain Chain to search.
   * @return Observable<TokenAmount> Searched token.
   */
  private searchTokenByAddress(
    tokens: List<TokenAmount>,
    address: string,
    chain: BlockchainName
  ): Observable<TokenAmount> {
    const searchingToken = tokens.find(
      token => compareAddresses(token.address, address) && token.blockchain === chain
    );

    return searchingToken
      ? of(searchingToken)
      : this.tokensService.fetchQueryTokens(address, chain).pipe(
          switchIif(
            backendTokens => Boolean(backendTokens?.size),
            backendTokens => of(backendTokens.first()),
            () => this.tokensService.addTokenByAddress(address, chain).pipe(first())
          ),
          map(fetchedToken => {
            const newToken = { ...fetchedToken, amount: new BigNumber(NaN) } as TokenAmount;
            this.tokensService.addToken(newToken);
            return newToken;
          })
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
    this.navigate();
  }

  public getUrlSearchParam(key: string): string {
    return new URLSearchParams(this.window.location.search).get(key) || undefined;
  }
}

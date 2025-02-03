import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  ON_CHAIN_TRADE_TYPE,
  OnChainTradeType,
  RangoTradeType,
  LifiSubProvider,
  RANGO_TO_RUBIC_PROVIDERS,
  LIFI_API_CROSS_CHAIN_PROVIDERS
} from 'rubic-sdk';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { QueryParams } from './models/query-params';
import { isSupportedLanguage } from '@shared/models/languages/supported-languages';
import { HeaderStore } from '@core/header/services/header.store';
import { TokensNetworkService } from '@core/services/tokens/tokens-network.service';
import { IframeService } from '@core/services/iframe-service/iframe.service';
import { WINDOW } from '@ng-web-apis/common';
import { SessionStorageService } from '@core/services/session-storage/session-storage.service';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  private readonly _queryParams$ = new BehaviorSubject<QueryParams>({});

  public readonly queryParams$ = this._queryParams$.asObservable();

  public testMode: boolean = false;

  public get queryParams(): QueryParams | undefined {
    return this._queryParams$.value;
  }

  private set queryParams(value: QueryParams) {
    this._queryParams$.next(value);
  }

  private readonly _tokensSelectionDisabled$ = new BehaviorSubject<[boolean, boolean]>([
    false,
    false
  ]);

  public tokensSelectionDisabled$ = this._tokensSelectionDisabled$.asObservable();

  public get noFrameLink(): string {
    const urlTree = this.router.parseUrl(this.router.url);
    return urlTree.toString();
  }

  public useLargeIframe: boolean;

  public hideUnusedUI: boolean;

  public hideTokenSwitcher: boolean;

  public isDesktop: boolean;

  public domain: string;

  public disabledLifiBridges: LifiSubProvider[] | undefined;

  public disabledRangoBridges: RangoTradeType[] | undefined;

  public disabledCrossChainProviders: CrossChainTradeType[] = [];

  public disabledOnChainProviders: OnChainTradeType[] = [];

  public enabledBlockchains: BlockchainName[];

  public slippageIt: number;

  public slippageCcr: number;

  public useSafe: boolean;

  public hideBranding: boolean;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly tokensNetworkService: TokensNetworkService,
    private readonly router: Router,
    private readonly translateService: TranslateService,
    private readonly iframeService: IframeService,
    private readonly sessionStorage: SessionStorageService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  public setupQueryParams(queryParams: QueryParams): void {
    if (Object.keys(this.queryParams).length) {
      return;
    }

    this.hideBranding = queryParams.hideBranding === 'true';
    this.useLargeIframe = queryParams.useLargeIframe === 'true';
    this.testMode = queryParams.testMode === 'true';
    this.hideUnusedUI = queryParams.hideUnusedUI === 'true';
    this.isDesktop = queryParams.isDesktop === 'true';
    this.domain = queryParams.domain;
    this.slippageCcr = parseFloat(queryParams.slippageCcr);
    this.slippageIt = parseFloat(queryParams.slippageIt);
    this.headerStore.forceDesktopResolution = queryParams.isDesktop;
    this.hideTokenSwitcher = queryParams.hideTokenSwitcher === 'true';
    this.setHideSelectionStatus(queryParams);
    this.setIframeInfo(queryParams);

    if (queryParams?.referral) {
      this.sessionStorage.setItem('referral', queryParams?.referral);
    }

    if (queryParams?.swapId) {
      this.sessionStorage.setItem('swapId', queryParams?.swapId);
    }

    if (queryParams?.whitelistOnChain || queryParams?.blacklistOnChain) {
      const urlParams = new URLSearchParams(this.window.location.search);
      const whitelistOnChain = this.parseStringQuery(urlParams.get('whitelistOnChain'));
      const blacklistOnChain = this.parseStringQuery(urlParams.get('blacklistOnChain'));

      this.setOnChainProviders(
        whitelistOnChain.map(provider => provider.toLowerCase()),
        blacklistOnChain.map(provider => provider.toLowerCase())
      );
    }

    if (queryParams?.whitelistCrossChain || queryParams?.blacklistCrossChain) {
      const urlParams = new URLSearchParams(this.window.location.search);
      const whitelistCrossChain = this.parseStringQuery(urlParams.get('whitelistCrossChain'));
      const blacklistCrossChain = this.parseStringQuery(urlParams.get('blacklistCrossChain'));

      this.setCrossChainProviders(
        whitelistCrossChain.map(provider => provider.toLowerCase()),
        blacklistCrossChain.map(provider => provider.toLowerCase())
      );
    }

    if (queryParams.enabledBlockchains) {
      this.enabledBlockchains = queryParams.enabledBlockchains;
    }

    if (queryParams.disabledLifiBridges) {
      this.setDisabledLifiBridges(queryParams.disabledLifiBridges);
    }

    if (queryParams.disabledRangoBridges) {
      this.setDisabledRangoBridges(queryParams.disabledRangoBridges);
    }

    this.queryParams = queryParams;
  }

  public patchQueryParams(params: Partial<QueryParams>): void {
    this.queryParams = {
      ...this.queryParams,
      ...params
    };
    this.router.navigate([], {
      queryParams: this.queryParams,
      queryParamsHandling: 'merge'
    });
  }

  private setIframeInfo(queryParams: QueryParams): void {
    if (queryParams.hideUnusedUI) {
      this.setLanguage(queryParams);
      this.setHideSelectionStatus(queryParams);
    }

    if (queryParams?.iframe !== 'true') {
      this.iframeService.setIframeFalse();
      return;
    }

    this.iframeService.setIframeInfo({
      iframe: true,
      device: queryParams.device,
      providerAddress: queryParams.feeTarget || queryParams.providerAddress,
      tokenSearch: queryParams.tokenSearch === 'true'
    });

    this.setHideSelectionStatus(queryParams);
    this.setAdditionalIframeTokens(queryParams);
    this.setLanguage(queryParams);
  }

  private setAdditionalIframeTokens(queryParams: QueryParams): void {
    if (!this.iframeService.isIframe) {
      return;
    }

    const tokensFilterKeys = Object.values(BLOCKCHAIN_NAME).map(el => el.toLowerCase());

    const tokensQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([key]) =>
        tokensFilterKeys.includes(key as BlockchainName)
      )
    );

    if (Object.keys(tokensQueryParams).length !== 0) {
      this.tokensNetworkService.setTokensRequestParameters(tokensQueryParams);
    }
  }

  private setDisabledLifiBridges(disabledBridges: string[]): void {
    const bridges = Object.values(LIFI_API_CROSS_CHAIN_PROVIDERS) || [];
    this.disabledLifiBridges = bridges.filter(bridge =>
      disabledBridges.includes(bridge.toLowerCase())
    );
  }

  private setDisabledRangoBridges(disabledBridges: string[]): void {
    const bridges = Object.keys(RANGO_TO_RUBIC_PROVIDERS) || [];
    this.disabledRangoBridges = bridges.filter(bridge =>
      disabledBridges.includes(bridge)
    ) as RangoTradeType[];
  }

  private setCrossChainProviders(
    whitelistCrossChain: string[],
    blacklistCrossChain: string[]
  ): void {
    if (whitelistCrossChain?.length) {
      this.disabledCrossChainProviders = Object.values(CROSS_CHAIN_TRADE_TYPE).filter(
        provider => !whitelistCrossChain.includes(provider.toLowerCase())
      );
    }

    if (blacklistCrossChain?.length) {
      const disabledProviders = Object.values(CROSS_CHAIN_TRADE_TYPE).filter(provider =>
        blacklistCrossChain.includes(provider.toLowerCase())
      );

      this.disabledCrossChainProviders = Array.from(
        new Set<CrossChainTradeType>([...this.disabledCrossChainProviders, ...disabledProviders])
      );
    }
  }

  private setOnChainProviders(whitelistOnChain: string[], blacklistOnChain: string[]): void {
    if (whitelistOnChain?.length) {
      this.disabledOnChainProviders = Object.values(ON_CHAIN_TRADE_TYPE).filter(
        provider => !whitelistOnChain.includes(provider.toLowerCase())
      );
    }

    if (blacklistOnChain?.length) {
      const disabledProviders = Object.values(ON_CHAIN_TRADE_TYPE).filter(provider =>
        blacklistOnChain.includes(provider.toLowerCase())
      );

      this.disabledOnChainProviders = Array.from(
        new Set<OnChainTradeType>([...this.disabledOnChainProviders, ...disabledProviders])
      );
    }
  }

  private setHideSelectionStatus(queryParams: QueryParams): void {
    const tokensSelectionDisabled: [boolean, boolean] = [
      queryParams.hideSelectionFrom === 'true',
      queryParams.hideSelectionTo === 'true'
    ];

    if (tokensSelectionDisabled.includes(true)) {
      this._tokensSelectionDisabled$.next(tokensSelectionDisabled);
    }
  }

  private setLanguage(queryParams: QueryParams): void {
    const language = isSupportedLanguage(queryParams.language) ? queryParams.language : 'en';
    this.translateService.use(language);
  }

  private parseStringQuery(value: string): string[] {
    if (value) {
      try {
        return JSON.parse(value.replace(/'/g, '"'));
      } catch {
        return [];
      }
    }

    return [];
  }
}

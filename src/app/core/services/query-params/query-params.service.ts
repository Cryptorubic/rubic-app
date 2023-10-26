import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BLOCKCHAIN_NAME,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  LIFI_BRIDGE_TYPES
} from 'rubic-sdk';
import { BehaviorSubject } from 'rxjs';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { QueryParams } from './models/query-params';
import { isSupportedLanguage } from '@shared/models/languages/supported-languages';
import { BlockchainName } from 'rubic-sdk';
import { HeaderStore } from '@core/header/services/header.store';
import { WINDOW } from '@ng-web-apis/common';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensNetworkService } from '@core/services/tokens/tokens-network.service';
import { LifiBridgeTypes } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-bridge-types';
import { IframeService } from '@core/services/iframe-service/iframe.service';

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

  public hideUnusedUI: boolean;

  public isDesktop: boolean;

  public domain: string;

  public disabledProviders: CrossChainTradeType[] | undefined;

  public disabledLifiBridges: LifiBridgeTypes[] | undefined;

  public enabledProviders: CrossChainTradeType[] | undefined;

  public enabledBlockchains: BlockchainName[];

  public backgroundColor: string;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly tokensStoreService: TokensStoreService,
    private readonly tokensNetworkService: TokensNetworkService,
    @Inject(DOCUMENT) private document: Document,
    private readonly router: Router,
    private readonly themeService: ThemeService,
    private readonly translateService: TranslateService,
    @Inject(WINDOW) private readonly window: Window,
    private readonly iframeService: IframeService
  ) {}

  public setupQueryParams(queryParams: QueryParams): void {
    if (Object.keys(this.queryParams).length) {
      return;
    }

    this.testMode = queryParams.testMode === 'true';
    this.hideUnusedUI = queryParams.hideUnusedUI === 'true';
    this.isDesktop = queryParams.isDesktop === 'true';
    this.domain = queryParams.domain;
    this.headerStore.forceDesktopResolution = queryParams.isDesktop;
    this.setHideSelectionStatus(queryParams);
    this.setIframeInfo(queryParams);

    if (queryParams.enabledProviders || queryParams.enabledBlockchains) {
      this.setEnabledProviders(queryParams.enabledProviders);
      this.setDisabledProviders(queryParams.enabledProviders);
      this.enabledBlockchains = queryParams.enabledBlockchains;
    }

    if (queryParams.disabledLifiBridges) {
      this.setDisabledLifiBridges(queryParams.disabledLifiBridges);
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

    if (!queryParams.hasOwnProperty('iframe')) {
      this.iframeService.setIframeFalse();
      return;
    }

    const { iframe } = queryParams;
    if (iframe !== 'true') {
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

    const tokensFilterKeys = Object.values(BLOCKCHAIN_NAME);

    const tokensQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([key]) =>
        tokensFilterKeys.includes(key as BlockchainName)
      )
    );

    if (Object.keys(tokensQueryParams).length !== 0) {
      this.tokensNetworkService.tokensRequestParameters = tokensQueryParams;
    }
  }

  private setDisabledLifiBridges(disabledBridges: string[]): void {
    const bridges = Object.values(LIFI_BRIDGE_TYPES) || [];
    this.disabledLifiBridges = bridges.filter(bridge =>
      disabledBridges.includes(bridge.toLowerCase())
    );
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

  private setHideSelectionStatus(queryParams: QueryParams): void {
    if (queryParams.hideUnusedUI !== 'true') {
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
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  LIFI_BRIDGE_TYPES,
  ON_CHAIN_TRADE_TYPE,
  OnChainTradeType
} from 'rubic-sdk';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { QueryParams } from './models/query-params';
import { isSupportedLanguage } from '@shared/models/languages/supported-languages';
import { HeaderStore } from '@core/header/services/header.store';
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

  public disabledLifiBridges: LifiBridgeTypes[] | undefined;

  public disabledCrossChainProviders: CrossChainTradeType[] = [];

  public disabledOnChainProviders: OnChainTradeType[] = [];

  public enabledBlockchains: BlockchainName[];

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly tokensNetworkService: TokensNetworkService,
    private readonly router: Router,
    private readonly translateService: TranslateService,
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

    if (queryParams?.whitelistOnChain || queryParams?.blacklistOnChain) {
      console.log('whitelistOnChain: ', queryParams?.whitelistOnChain);
      console.log('blacklistOnChain: ', queryParams?.blacklistOnChain);
      console.log(
        'all cross-chain providers: ',
        Object.values(CROSS_CHAIN_TRADE_TYPE).map(provider => provider.toLowerCase())
      );
      this.setOnChainProviders(
        queryParams.whitelistOnChain?.toLowerCase(),
        queryParams.blacklistOnChain?.toLowerCase()
      );
    }

    if (queryParams?.whitelistCrossChain || queryParams?.blacklistCrossChain) {
      console.log('whitelistCrossChain: ', queryParams?.whitelistCrossChain);
      console.log('blacklistCrossChain: ', queryParams?.blacklistCrossChain);
      console.log(
        'all on-chain providers: ',
        Object.values(ON_CHAIN_TRADE_TYPE).map(provider => provider.toLowerCase())
      );
      this.setCrossChainProviders(
        queryParams.whitelistCrossChain?.toLowerCase(),
        queryParams.blacklistCrossChain?.toLowerCase()
      );
    }

    if (queryParams.enabledBlockchains) {
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

    const tokensFilterKeys = Object.values(BLOCKCHAIN_NAME).map(el => el.toLowerCase());

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

  private setCrossChainProviders(whitelistCrossChain: string, blacklistCrossChain: string): void {
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

  private setOnChainProviders(whitelistOnChain: string, blacklistOnChain: string): void {
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
}

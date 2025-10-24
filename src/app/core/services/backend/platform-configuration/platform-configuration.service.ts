import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from 'src/environments/environment';

import { BehaviorSubject, catchError, forkJoin, map, Observable, of, retry, tap } from 'rxjs';
import { PlatformConfig } from '@core/services/backend/platform-configuration/models/platform-config';
import { CrossChainProviderStatus } from '@core/services/backend/platform-configuration/models/cross-chain-provider-status';
import { defaultConfig } from '@core/services/backend/platform-configuration/constants/default-config';
import { timeout } from 'rxjs/operators';
import { BackendBlockchainStatus } from '@core/services/backend/platform-configuration/models/backend-blockchain-status';
import { BlockchainStatus } from '@core/services/backend/platform-configuration/models/blockchain-status';
import {
  BackendBlockchain,
  BLOCKCHAIN_NAME,
  BlockchainName,
  CrossChainTradeType,
  FROM_BACKEND_BLOCKCHAINS,
  FROM_BACKEND_CROSS_CHAIN_PROVIDERS,
  ToBackendCrossChainProviders
} from '@cryptorubic/core';
import { defaultInfoV3Config } from './constants/defauls-info-v3-config';
import { PlatformConfigV3, PlatformConfigV3CcrProviderInfo } from './models/platform-config-v3';

interface ProvidersConfiguration {
  disabledCrossChainTradeTypes: CrossChainTradeType[];
}

const temporarelyDisabledBlockchains: Partial<BlockchainName[]> = [
  BLOCKCHAIN_NAME.TRON,
  BLOCKCHAIN_NAME.BITCOIN,
  BLOCKCHAIN_NAME.BITGERT,
  BLOCKCHAIN_NAME.MOONBEAM,
  BLOCKCHAIN_NAME.FUSE,
  BLOCKCHAIN_NAME.OKE_X_CHAIN,
  BLOCKCHAIN_NAME.CRONOS,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.CELO,
  BLOCKCHAIN_NAME.GNOSIS
];

@Injectable({
  providedIn: 'root'
})
export class PlatformConfigurationService {
  private readonly _disabledProviders$ = new BehaviorSubject<ProvidersConfiguration>({
    disabledCrossChainTradeTypes: undefined
  });

  public readonly disabledProviders$ = this._disabledProviders$.asObservable();

  private readonly _ccrProvidersInfo$ = new BehaviorSubject<
    Record<CrossChainTradeType, PlatformConfigV3CcrProviderInfo>
  >(undefined);

  public readonly ccrProvidersInfo$ = this._ccrProvidersInfo$.asObservable();

  public get providersAverageTime(): Record<CrossChainTradeType, PlatformConfigV3CcrProviderInfo> {
    return this._ccrProvidersInfo$.getValue();
  }

  public get disabledProviders(): ProvidersConfiguration {
    return this._disabledProviders$.getValue();
  }

  private readonly _availableBlockchains$ = new BehaviorSubject<BlockchainStatus[]>(undefined);

  public readonly availableBlockchains$ = this._availableBlockchains$.asObservable();

  public get availableBlockchains(): BlockchainStatus[] {
    return this._availableBlockchains$.getValue();
  }

  private readonly _useOnChainProxy$ = new BehaviorSubject<boolean>(undefined);

  public readonly useOnChainProxy$ = this._useOnChainProxy$.asObservable();

  public get useOnChainProxy(): boolean {
    return this._useOnChainProxy$.getValue();
  }

  private readonly _useCrossChainProxy$ = new BehaviorSubject<Record<CrossChainTradeType, boolean>>(
    undefined
  );

  public readonly useCrossChainChainProxy$ = this._useOnChainProxy$.asObservable();

  public get useCrossChainChainProxy(): Record<CrossChainTradeType, boolean> {
    return this._useCrossChainProxy$.getValue();
  }

  constructor(private httpClient: HttpClient) {
    const availableBlockchains = Object.values(BLOCKCHAIN_NAME).map(blockchain => ({
      tier: 2,
      blockchain,
      isActive: !temporarelyDisabledBlockchains.includes(blockchain)
    })) as BlockchainStatus[];
    this._availableBlockchains$.next(availableBlockchains);
  }

  public loadPlatformConfig(): Observable<boolean> {
    return forkJoin([
      this.httpClient
        .get<PlatformConfig>(`${ENVIRONMENT.apiBaseUrl}/info/status_info_with_tier`)
        .pipe(
          timeout(5_000),
          retry(1),
          catchError(() => of(defaultConfig))
        ),
      this.httpClient
        .get<PlatformConfigV3>(`${ENVIRONMENT.apiBaseUrl}/v2/info/status_info_v3`)
        .pipe(
          timeout(5_000),
          retry(1),
          catchError(() => of(defaultInfoV3Config))
        )
    ]).pipe(
      tap(([infoResponse, infoV3Response]) => {
        if (infoResponse.server_is_active === true) {
          this._availableBlockchains$.next(this.mapAvailableBlockchains(infoResponse.networks));
          this._disabledProviders$.next(
            this.mapDisabledProviders(infoResponse.cross_chain_providers)
          );
          this._useOnChainProxy$.next(infoResponse.on_chain_providers.proxy.active);
          this.handleCcrProvidersInfo(infoV3Response.crosschainProviders);
          this.handleCrossChainProxyProviders(infoResponse.cross_chain_providers);
        }
      }),
      map(([infoResponse]) => infoResponse.server_is_active)
    );
  }

  public isAvailableBlockchain(blockchain: BlockchainName): boolean {
    return this.availableBlockchains
      ? this.availableBlockchains.some(el => el.blockchain === blockchain && el.isActive)
      : true;
  }

  private mapAvailableBlockchains(availableBlockchains: {
    [chain: string]: BackendBlockchainStatus;
  }): BlockchainStatus[] {
    const tierMap = {
      TIER_ONE: 1,
      TIER_TWO: 2
      // TIER_THREE: 3
    } as const;
    return Object.entries(availableBlockchains).map(([blockchain, params]) => ({
      isActive: params.is_active,
      blockchain: FROM_BACKEND_BLOCKCHAINS[blockchain as BackendBlockchain],
      tier: tierMap[params.tier]
    }));
  }

  private handleCrossChainProxyProviders(crossChainProviders: {
    [k in string]: CrossChainProviderStatus;
  }): void {
    const crossChainProvidersEntries = Object.entries(crossChainProviders) as [
      ToBackendCrossChainProviders,
      CrossChainProviderStatus
    ][];
    if (!crossChainProvidersEntries.length) {
      return;
    }
    const providers = Object.fromEntries(
      crossChainProvidersEntries.map(([provider, status]) => [
        FROM_BACKEND_CROSS_CHAIN_PROVIDERS[provider],
        status.useProxy
      ])
    ) as Record<CrossChainTradeType, boolean>;
    this._useCrossChainProxy$.next(providers);
  }

  private mapDisabledProviders(crossChainProviders: {
    [k in string]: CrossChainProviderStatus;
  }): ProvidersConfiguration {
    const crossChainProvidersEntries = Object.entries(crossChainProviders) as [
      ToBackendCrossChainProviders,
      CrossChainProviderStatus
    ][];

    if (!crossChainProvidersEntries.length) {
      return this._disabledProviders$.getValue();
    }
    const disabledCrossChainProviders = crossChainProvidersEntries
      .filter(([_, { active }]) => !active)
      .map(([providerName]) => FROM_BACKEND_CROSS_CHAIN_PROVIDERS[providerName])
      .filter(provider => Boolean(provider));

    return { disabledCrossChainTradeTypes: disabledCrossChainProviders };
  }

  private handleCcrProvidersInfo(
    crossChainProviders: Record<ToBackendCrossChainProviders, PlatformConfigV3CcrProviderInfo>
  ): void {
    const entries = Object.entries(crossChainProviders) as [
      ToBackendCrossChainProviders,
      PlatformConfigV3CcrProviderInfo
    ][];
    const info = Object.fromEntries(
      entries.map(([provider, status]) => [FROM_BACKEND_CROSS_CHAIN_PROVIDERS[provider], status])
    ) as Record<CrossChainTradeType, PlatformConfigV3CcrProviderInfo>;

    this._ccrProvidersInfo$.next(info);
  }
}

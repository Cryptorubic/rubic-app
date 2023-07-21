import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from 'src/environments/environment';
import {
  BackendBlockchain,
  FROM_BACKEND_BLOCKCHAINS
} from '@app/shared/constants/blockchain/backend-blockchains';
import { BehaviorSubject, catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import {
  BlockchainName,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  LifiBridgeTypes,
  BLOCKCHAIN_NAME,
  TestnetEvmBlockchain
} from 'rubic-sdk';
import { FROM_BACKEND_CROSS_CHAIN_PROVIDERS } from '../cross-chain-routing-api/constants/from-backend-cross-chain-providers';
import { PlatformConfig } from '@core/services/backend/platform-configuration/models/platform-config';
import { CrossChainProviderStatus } from '@core/services/backend/platform-configuration/models/cross-chain-provider-status';
import { defaultConfig } from '@core/services/backend/platform-configuration/constants/default-config';
import { testnetBlockchainsList } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { ToBackendCrossChainProviders } from '@core/services/backend/cross-chain-routing-api/constants/to-backend-cross-chain-providers';

interface DisabledBridgeTypes {
  [CROSS_CHAIN_TRADE_TYPE.LIFI]: LifiBridgeTypes[];
}

interface ProvidersConfiguration {
  disabledBridgeTypes: DisabledBridgeTypes;
  disabledCrossChainTradeTypes: CrossChainTradeType[];
}

const temporarelyDisabledBlockchains: Partial<BlockchainName[]> = [
  BLOCKCHAIN_NAME.TRON,
  BLOCKCHAIN_NAME.BITCOIN,
  BLOCKCHAIN_NAME.BITGERT,
  BLOCKCHAIN_NAME.ETHEREUM_POW,
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
    disabledBridgeTypes: undefined,
    disabledCrossChainTradeTypes: undefined
  });

  public readonly disabledProviders$ = this._disabledProviders$.asObservable();

  public get disabledProviders(): ProvidersConfiguration {
    return this._disabledProviders$.getValue();
  }

  private readonly _availableBlockchains$ = new BehaviorSubject<BlockchainName[]>(undefined);

  public readonly availableBlockchains$ = this._availableBlockchains$.asObservable();

  public get availableBlockchains(): BlockchainName[] {
    return this._availableBlockchains$.getValue();
  }

  private readonly _useOnChainProxy$ = new BehaviorSubject<boolean>(undefined);

  public readonly useOnChainProxy$ = this._useOnChainProxy$.asObservable();

  public get useOnChainProxy(): boolean {
    return this._useOnChainProxy$.getValue();
  }

  private readonly _useCrossChainChainProxy$ = new BehaviorSubject<
    Record<CrossChainTradeType, boolean>
  >(undefined);

  public readonly useCrossChainChainProxy$ = this._useOnChainProxy$.asObservable();

  public get useCrossChainChainProxy(): Record<CrossChainTradeType, boolean> {
    return this._useCrossChainChainProxy$.getValue();
  }

  constructor(private httpClient: HttpClient) {
    const availableBlockchains = Object.values(BLOCKCHAIN_NAME).filter(
      blockchain => !temporarelyDisabledBlockchains.includes(blockchain)
    );
    this._availableBlockchains$.next(availableBlockchains);
  }

  public loadPlatformConfig(): Observable<boolean> {
    const responses = [
      this.httpClient.get<PlatformConfig>(`${ENVIRONMENT.apiBaseUrl}/info/status_info`),
      this.httpClient
        .get<PlatformConfig>(`${ENVIRONMENT.apiBaseUrl}/info/status_info`)
        .pipe(catchError(() => of(defaultConfig)))
    ];
    return forkJoin(responses).pipe(
      map(([mainResponse, testnetResponse]) => ({
        server_is_active: mainResponse.server_is_active,
        cross_chain_providers: {
          ...testnetResponse.cross_chain_providers,
          ...mainResponse.cross_chain_providers
        },
        on_chain_providers: { ...mainResponse.on_chain_providers },
        networks: {
          ...testnetResponse.networks,
          ...mainResponse.networks
        }
      })),
      catchError(() => of(defaultConfig)),
      tap(response => {
        if (response.server_is_active === true) {
          this._availableBlockchains$.next(this.mapAvailableBlockchains(response.networks));
          this._disabledProviders$.next(this.mapDisabledProviders(response.cross_chain_providers));
          this._useOnChainProxy$.next(response.on_chain_providers.proxy.active);
          this.handleCrossChainProxyProviders(response.cross_chain_providers);
        }
      }),
      map(response => response.server_is_active)
    );
  }

  public isAvailableBlockchain(blockchain: BlockchainName): boolean {
    if (testnetBlockchainsList.includes(blockchain as TestnetEvmBlockchain)) {
      return true;
    }
    return this.availableBlockchains ? this.availableBlockchains.includes(blockchain) : true;
  }

  private mapAvailableBlockchains(availableBlockchains: {
    [chain: string]: boolean;
  }): BlockchainName[] {
    return Object.entries(availableBlockchains)
      .filter(([_, availability]) => availability)
      .map(([blockchain]) => FROM_BACKEND_BLOCKCHAINS[blockchain as BackendBlockchain]);
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
    this._useCrossChainChainProxy$.next(providers);
  }

  private mapDisabledProviders(crossChainProviders: {
    [k in string]: CrossChainProviderStatus;
  }): ProvidersConfiguration {
    const crossChainProvidersEntries = Object.entries(crossChainProviders) as [
      ToBackendCrossChainProviders,
      CrossChainProviderStatus
    ][];

    if (!crossChainProvidersEntries.length) {
      return { disabledBridgeTypes: undefined, disabledCrossChainTradeTypes: undefined };
    }

    const disabledCrossChainProviders = crossChainProvidersEntries
      .filter(([_, { active }]) => !active)
      .map(([providerName]) => FROM_BACKEND_CROSS_CHAIN_PROVIDERS[providerName])
      .filter(provider => Boolean(provider));

    const disabledBridgeTypes = crossChainProvidersEntries
      .filter(([_, { disabledProviders, active }]) => Boolean(disabledProviders.length && active))
      .reduce((acc, [providerName, { disabledProviders }]) => {
        if (FROM_BACKEND_CROSS_CHAIN_PROVIDERS[providerName] === CROSS_CHAIN_TRADE_TYPE.LIFI) {
          acc[CROSS_CHAIN_TRADE_TYPE.LIFI] = disabledProviders as LifiBridgeTypes[];
        }

        return acc;
      }, {} as DisabledBridgeTypes);

    return { disabledBridgeTypes, disabledCrossChainTradeTypes: disabledCrossChainProviders };
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from 'src/environments/environment';
import {
  BackendBlockchain,
  FROM_BACKEND_BLOCKCHAINS
} from '@app/shared/constants/blockchain/backend-blockchains';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { BlockchainName, CROSS_CHAIN_TRADE_TYPE } from 'rubic-sdk';
import { BACKEND_CROSS_CHAIN_PROVIDERS } from '../instant-trades-api/constants/backend-providers';

export interface CrossChainProviderStatus {
  active: boolean;
  disabledProviders: string[];
}

export interface PlatformConfig {
  server_is_active: boolean;
  networks: {
    [key: BackendBlockchain]: boolean;
  };
  cross_chain_providers: {
    [key: string]: CrossChainProviderStatus;
  };
}

interface DisabledBridgeTypes {
  [CROSS_CHAIN_TRADE_TYPE.RANGO]: string[];
  [CROSS_CHAIN_TRADE_TYPE.LIFI]: string[];
}

export interface ProvidersConfiguration {
  disabledBridgeTypes: DisabledBridgeTypes;
  disabledCrossChainProviders: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PlatformConfigurationService {
  private readonly _disabledProviders$ = new BehaviorSubject<ProvidersConfiguration>(undefined);

  public get disabledProviders$(): Observable<ProvidersConfiguration> {
    return this._disabledProviders$.asObservable();
  }

  public get disabledProviders(): ProvidersConfiguration {
    return this._disabledProviders$.getValue();
  }

  private readonly _availableBlockchains$ = new BehaviorSubject<BlockchainName[]>(undefined);

  public get availableBlockchains$(): Observable<BlockchainName[]> {
    return this._availableBlockchains$.asObservable();
  }

  public get availableBlockchains(): BlockchainName[] {
    return this._availableBlockchains$.getValue();
  }

  constructor(private httpClient: HttpClient) {}

  public loadPlatformConfig(): Observable<boolean> {
    return this.httpClient.get<PlatformConfig>(`${ENVIRONMENT.apiBaseUrl}/info/status_info`).pipe(
      tap(response => {
        if (response.server_is_active === true) {
          this._availableBlockchains$.next(this.mapAvailableBlockchains(response.networks));
          this._disabledProviders$.next(this.mapDisabledProviders(response.cross_chain_providers));
        }
      }),
      map(response => response.server_is_active),
      catchError(() => of(true)),
      tap(() => console.log(this.disabledProviders))
    );
  }

  public isAvailableBlockchain(blockchain: BlockchainName): boolean {
    return this.availableBlockchains.includes(blockchain);
  }

  private mapAvailableBlockchains(availableBlockchains: {
    [key: BackendBlockchain]: boolean;
  }): BlockchainName[] {
    return Object.entries(availableBlockchains)
      .filter(([_, availability]) => availability)
      .map(entry => {
        console.log(FROM_BACKEND_BLOCKCHAINS[entry[0]], entry[0]);
        return FROM_BACKEND_BLOCKCHAINS[entry[0]];
      });
  }

  private mapDisabledProviders(crossChainProviders: {
    [key: string]: CrossChainProviderStatus;
  }): ProvidersConfiguration {
    const disabledCrossChainProviders = Object.entries(crossChainProviders)
      .filter(([_, { active }]) => {
        return !active;
      })
      .map(([providerName]) => BACKEND_CROSS_CHAIN_PROVIDERS[providerName]);

    const disabledBridgeTypes = Object.entries(crossChainProviders)
      .filter(([_, { disabledProviders, active }]) => Boolean(disabledProviders.length && active))
      .reduce((acc, [providerName, { disabledProviders }]) => {
        if (BACKEND_CROSS_CHAIN_PROVIDERS[providerName] === CROSS_CHAIN_TRADE_TYPE.RANGO) {
          acc[CROSS_CHAIN_TRADE_TYPE.RANGO] = disabledProviders;
        }

        if (BACKEND_CROSS_CHAIN_PROVIDERS[providerName] === CROSS_CHAIN_TRADE_TYPE.LIFI) {
          acc[CROSS_CHAIN_TRADE_TYPE.LIFI] = disabledProviders;
        }

        return acc;
      }, {} as DisabledBridgeTypes);

    return { disabledBridgeTypes, disabledCrossChainProviders };
  }

  public healthCheck(): Promise<boolean> {
    return new Promise(resolve => {
      this.httpClient
        .get(`${ENVIRONMENT.apiBaseUrl}/v1/healthcheck`, { observe: 'response' })
        .subscribe(
          response => resolve(response.status === 200),
          () => resolve(false)
        );
    });
  }
}

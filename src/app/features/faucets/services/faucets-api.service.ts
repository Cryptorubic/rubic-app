import { Injectable } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../../../../environments/environment';
import {
  BackendBlockchain,
  FROM_BACKEND_BLOCKCHAINS
} from '@shared/constants/blockchain/backend-blockchains';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendPagination } from '@shared/models/backend/backend-pagination';
import { BackendFaucet } from '@features/faucets/models/backend-faucet';
import { Faucet } from '@features/faucets/models/faucet';
import { Cacheable } from 'ts-cacheable';

@Injectable()
export class FaucetsApiService {
  private readonly tokensApiUrl = `${ENVIRONMENT.apiTokenUrl}/v1/`;

  constructor(private readonly httpClient: HttpClient) {}

  public fetchNetworks(): Observable<BlockchainName[]> {
    return this.httpClient
      .get<BackendBlockchain[]>(`${this.tokensApiUrl}networks`)
      .pipe(map(blockchains => blockchains.map(chain => FROM_BACKEND_BLOCKCHAINS[chain])));
  }

  public getFaucets(): Observable<Partial<Record<BlockchainName, Faucet[]>>> {
    return this.fetchFaucets().pipe(
      map(faucetsResponse => this.castFromBackendFaucets(faucetsResponse.results))
    );
  }

  @Cacheable({
    maxAge: 60_000
  })
  private fetchFaucets(): Observable<BackendPagination<BackendFaucet>> {
    return this.httpClient.get<BackendPagination<BackendFaucet>>(
      `${this.tokensApiUrl}token_sources/faucets`
    );
  }

  private castFromBackendFaucets(
    backendFaucets: BackendFaucet[]
  ): Partial<Record<BlockchainName, Faucet[]>> {
    const blockchainFaucetMap = new Map<string, Faucet[]>();
    backendFaucets.forEach(faucet => {
      const currentFaucet = {
        token: {
          address: faucet.address,
          symbol: faucet.symbol,
          icon_url: faucet.icon_url
        },
        url: faucet.url,
        name: faucet.faucet_title
      };
      const network = FROM_BACKEND_BLOCKCHAINS[faucet.network];

      const value = blockchainFaucetMap.has(network)
        ? [...blockchainFaucetMap.get(network), currentFaucet]
        : [currentFaucet];
      blockchainFaucetMap.set(network, value);
    });

    return Object.fromEntries(blockchainFaucetMap.entries());
  }
}

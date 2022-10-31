import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';

import { BlockchainName } from 'rubic-sdk';
import { ENVIRONMENT } from 'src/environments/environment';
import { TO_BACKEND_BLOCKCHAINS } from '@app/shared/constants/blockchain/backend-blockchains';
import { Observable } from 'rxjs';
import { BACKEND_CROSS_CHAIN_PROVIDERS } from '../instant-trades-api/constants/backend-providers';

export const BASE_URL = `${ENVIRONMENT.crossChain.apiBaseUrl}/`;

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingApiService {
  constructor(private readonly httpService: HttpService) {}

  public saveNewProvider(
    blockchain: BlockchainName,
    title: string,
    address: string
  ): Observable<void> {
    return this.httpService.post(`${ENVIRONMENT.apiBaseUrl}/info/new_provider`, {
      blockchain: TO_BACKEND_BLOCKCHAINS[blockchain],
      title: BACKEND_CROSS_CHAIN_PROVIDERS[title],
      address
    });
  }
}

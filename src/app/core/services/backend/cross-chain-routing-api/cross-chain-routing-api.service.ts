import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';

import { BlockchainName, CrossChainTradeType } from 'rubic-sdk';
import { ENVIRONMENT } from 'src/environments/environment';
import { TO_BACKEND_BLOCKCHAINS } from '@app/shared/constants/blockchain/backend-blockchains';
import { Observable } from 'rxjs';
import { TO_BACKEND_CROSS_CHAIN_PROVIDERS } from './constants/to-backend-cross-chain-providers';

export const BASE_URL = `${ENVIRONMENT.crossChain.apiBaseUrl}/`;

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingApiService {
  constructor(private readonly httpService: HttpService) {}

  public saveNewProvider(
    blockchain: BlockchainName,
    tradeType: CrossChainTradeType,
    address: string
  ): Observable<void> {
    return this.httpService.post(`info/new_provider`, {
      network: TO_BACKEND_BLOCKCHAINS[blockchain],
      title: TO_BACKEND_CROSS_CHAIN_PROVIDERS[tradeType],
      address
    });
  }
}

import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CoingeckoApiService {
  private baseUrl = 'https://api.coingecko.com/api/v3/';

  constructor(private httpClient: HttpClient) {}

  public async getEtherPriceInUsd(): Promise<BigNumber> {
    return this.getTokenUsdPriceById('ethereum');
  }

  public async getTokenUsdPriceById(tokenCoingeckoId: string): Promise<BigNumber> {
    const response = await this.httpClient
      .get(`${this.baseUrl}simple/price`, {
        params: { ids: tokenCoingeckoId, vs_currencies: 'usd' }
      })
      .toPromise();
    return new BigNumber(response[tokenCoingeckoId].usd);
  }
}

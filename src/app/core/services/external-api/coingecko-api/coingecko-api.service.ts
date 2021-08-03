import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CoingeckoApiService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3/';

  constructor(private httpClient: HttpClient, private tokenService: TokensService) {}

  public async getEtherPriceInUsd(): Promise<BigNumber> {
    // console.log(this.getTokenUsdPriceByAddress('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'));
    try {
      return await this.getTokenUsdPriceByCoingeckoId('ethereum');
    } catch (coingeckoError) {
      console.debug('Coingecko is not alive');
      return new BigNumber(0);
    }
  }

  public async getTokenUsdPriceByCoingeckoId(tokenCoingeckoId: string): Promise<BigNumber> {
    const response = await this.httpClient
      .get(`${this.baseUrl}simple/price`, {
        params: { ids: tokenCoingeckoId, vs_currencies: 'usd' }
      })
      .toPromise();
    return new BigNumber(response[tokenCoingeckoId].usd);
  }

  public async getTokenUsdPriceByAddress(address: string) {
    const foundToken = await this.tokenService.tokens
      .pipe(map(tokens => tokens.find(token => token.address === address)))
      .toPromise();

    return foundToken.price;
  }
}

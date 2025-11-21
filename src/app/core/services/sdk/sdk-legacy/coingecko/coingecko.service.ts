import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlockchainName, Cache as Memo, TO_BACKEND_BLOCKCHAINS } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { firstValueFrom } from 'rxjs';

interface TokenPriceFromBackend {
  network: string;
  address: string;
  usd_price: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class CoingeckoService {
  constructor(private readonly httpClient: HttpClient) {}

  @Memo({
    maxAge: 1000 * 60 * 5
  })
  private async getTokenPriceFromBackend(
    blockchain: BlockchainName,
    tokenAddress: string
  ): Promise<TokenPriceFromBackend> {
    try {
      const backendBlockchain = TO_BACKEND_BLOCKCHAINS[blockchain];
      const result = await firstValueFrom(
        this.httpClient.get<TokenPriceFromBackend>(
          `https://api.rubic.exchange/api/v2/tokens/price/${backendBlockchain}/${tokenAddress}`
        )
      );

      return result;
    } catch (error) {
      console.debug(error);

      return {
        network: blockchain,
        address: tokenAddress,
        usd_price: null
      };
    }
  }

  /**
   * Gets price of common token or native coin in usd from coingecko.
   * @param token Token to get price for.
   */
  public async getTokenPrice(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<BigNumber> {
    const response = await this.getTokenPriceFromBackend(token.blockchain, token.address);

    return new BigNumber(response?.usd_price || NaN);
  }
}

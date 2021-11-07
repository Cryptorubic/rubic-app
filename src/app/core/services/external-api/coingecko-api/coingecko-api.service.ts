import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, timeout } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { Cacheable } from 'ts-cacheable';

const supportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.XDAI,
  BLOCKCHAIN_NAME.AVALANCHE
] as const;

type SupportedBlockchain = typeof supportedBlockchains[number];

const API_BASE_URL = 'https://api.coingecko.com/api/v3/';

@Injectable({
  providedIn: 'root'
})
export class CoingeckoApiService {
  private readonly nativeCoinsCoingeckoIds: Record<SupportedBlockchain, string>;

  private readonly tokenBlockchainId: Record<SupportedBlockchain, string>;

  constructor(private readonly httpClient: HttpClient) {
    this.nativeCoinsCoingeckoIds = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binancecoin',
      [BLOCKCHAIN_NAME.POLYGON]: 'matic-network',
      [BLOCKCHAIN_NAME.HARMONY]: 'harmony',
      [BLOCKCHAIN_NAME.XDAI]: 'xdai',
      [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche-2'
    };

    this.tokenBlockchainId = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binance-smart-chain',
      [BLOCKCHAIN_NAME.POLYGON]: 'polygon-pos',
      [BLOCKCHAIN_NAME.HARMONY]: 'harmony-shard-0',
      [BLOCKCHAIN_NAME.XDAI]: 'xdai',
      [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche'
    };
  }

  private isSupportedBlockchain(blockchain: BLOCKCHAIN_NAME): blockchain is SupportedBlockchain {
    return supportedBlockchains.some(supportedBlockchain => supportedBlockchain === blockchain);
  }

  /**
   * Gets price of native coin in usd from coingecko.
   * @param blockchain Supported by {@link supportedBlockchains} blockchain.
   */
  @Cacheable({
    maxAge: 13_000,
    maxCacheCount: supportedBlockchains.length
  })
  public getNativeCoinPrice(blockchain: BLOCKCHAIN_NAME): Observable<number | undefined> {
    if (!this.isSupportedBlockchain(blockchain)) {
      return of(undefined);
    }

    const coingeckoId = this.nativeCoinsCoingeckoIds[blockchain];
    return this.httpClient
      .get(`${API_BASE_URL}simple/price`, {
        params: { ids: coingeckoId, vs_currencies: 'usd' }
      })
      .pipe(
        timeout(3_000),
        map((response: { [key: string]: { usd: string } }) => {
          return +response[coingeckoId].usd;
        }),
        catchError(_err => {
          console.debug('Coingecko is not alive');
          return of(undefined);
        })
      );
  }

  /**
   * Gets price of token in usd from coingecko.
   * @param blockchain Supported by {@link supportedBlockchains} blockchain.
   * @param tokenAddress Address of token to get price for.
   */
  @Cacheable({
    maxAge: 13_000,
    maxCacheCount: 4
  })
  public getCommonTokenPrice(
    blockchain: BLOCKCHAIN_NAME,
    tokenAddress: string
  ): Observable<number | undefined> {
    if (!this.isSupportedBlockchain(blockchain)) {
      return of(undefined);
    }

    const blockchainId = this.tokenBlockchainId[blockchain];
    return this.httpClient
      .get(`${API_BASE_URL}coins/${blockchainId}/contract/${tokenAddress.toLowerCase()}`)
      .pipe(
        timeout(3_000),
        map((response: { market_data: { current_price: { usd: number } } }) => {
          return response?.market_data?.current_price?.usd;
        }),
        catchError(err => {
          console.debug('Coingecko cannot retrieve token price', err);
          return of(undefined);
        })
      );
  }

  /**
   * Gets price of common token or native coin in usd from coingecko.
   * @param token Token to get price for.
   */
  public getCommonTokenOrNativeCoinPrice(token: { address: string; blockchain: BLOCKCHAIN_NAME }) {
    if (Web3Public.isNativeAddress(token.address)) {
      return this.getNativeCoinPrice(token.blockchain);
    }
    return this.getCommonTokenPrice(token.blockchain, token.address);
  }
}

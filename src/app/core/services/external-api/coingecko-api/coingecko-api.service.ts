import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, first, map, skip, tap, timeout } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';

const supportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.XDAI,
  BLOCKCHAIN_NAME.AVALANCHE
] as const;

type SupportedBlockchain = typeof supportedBlockchains[number];

type NativeCoinsData = Record<
  SupportedBlockchain,
  {
    coingeckoId: string;
    price$: BehaviorSubject<number>;
    lastResponseTime: number;
    isRequestInProgress: boolean;
  }
>;

@Injectable({
  providedIn: 'root'
})
export class CoingeckoApiService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3/';

  private nativeCoinsData: NativeCoinsData;

  private readonly tokenBlockchainId: Record<SupportedBlockchain, string>;

  constructor(private httpClient: HttpClient) {
    const coingeckoIds: Record<SupportedBlockchain, string> = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binancecoin',
      [BLOCKCHAIN_NAME.POLYGON]: 'matic-network',
      [BLOCKCHAIN_NAME.HARMONY]: 'harmony',
      [BLOCKCHAIN_NAME.XDAI]: 'xdai',
      [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche-2'
    };

    supportedBlockchains.forEach(blockchain => {
      this.nativeCoinsData = {
        ...this.nativeCoinsData,
        [blockchain]: {
          coingeckoId: coingeckoIds[blockchain],
          price$: new BehaviorSubject<number>(undefined),
          lastResponseTime: -Infinity,
          isRequestInProgress: false
        }
      };
    });

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
    return !!supportedBlockchains.find(supportedBlockchain => supportedBlockchain === blockchain);
  }

  /**
   * Gets price of native coin from coingecko.
   * @param blockchain Supported by {@link supportedBlockchains} blockchain.
   */
  public getNativeCoinPriceInUsdByCoingecko(
    blockchain: BLOCKCHAIN_NAME
  ): Observable<number | undefined> {
    if (!this.isSupportedBlockchain(blockchain)) {
      return of(undefined);
    }

    const nativeCoinData = this.nativeCoinsData[blockchain];
    if (nativeCoinData.isRequestInProgress) {
      return nativeCoinData.price$.pipe(skip(1), first());
    }

    const requestDebounce = 13_000; // 13 seconds
    if (Date.now() - nativeCoinData.lastResponseTime <= requestDebounce) {
      return nativeCoinData.price$.pipe(first());
    }

    this.nativeCoinsData = {
      ...this.nativeCoinsData,
      [blockchain]: {
        ...nativeCoinData,
        isRequestInProgress: true
      }
    };

    const { coingeckoId } = nativeCoinData;
    const requestTimeout = 3_000; // 3 seconds
    return this.httpClient
      .get(`${this.baseUrl}simple/price`, {
        params: { ids: coingeckoId, vs_currencies: 'usd' }
      })
      .pipe(
        timeout(requestTimeout),
        map((response: { [key: string]: { usd: string } }) => {
          return +response[coingeckoId].usd;
        }),
        catchError((_err: unknown) => {
          console.debug('Coingecko is not alive');
          return of(undefined);
        }),
        tap(price => {
          this.nativeCoinsData = {
            ...this.nativeCoinsData,
            [blockchain]: {
              ...nativeCoinData,
              lastResponseTime: Date.now(),
              isRequestInProgress: false
            }
          };
          nativeCoinData.price$.next(price);
        })
      );
  }

  /**
   * Gets price of token from coingecko.
   * @param token Token with supported by {@link supportedBlockchains} blockchain.
   */
  public getTokenPrice(token: {
    address: string;
    blockchain: BLOCKCHAIN_NAME;
  }): Observable<number | undefined> {
    if (Web3Public.isNativeAddress(token.address)) {
      return this.getNativeCoinPriceInUsdByCoingecko(token.blockchain);
    }

    if (!this.isSupportedBlockchain(token.blockchain)) {
      return of(undefined);
    }

    const blockchainId = this.tokenBlockchainId[token.blockchain];
    const requestTimeout = 3_000; // 3 seconds
    return this.httpClient
      .get(`${this.baseUrl}coins/${blockchainId}/contract/${token.address.toLowerCase()}`)
      .pipe(
        timeout(requestTimeout),
        map((response: { market_data: { current_price: { usd: number } } }) => {
          return response?.market_data?.current_price?.usd;
        }),
        catchError((err: unknown) => {
          console.debug('Coingecko cannot retrieve token price', err);
          return of(undefined);
        })
      );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, first, map, skip, timeout } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';

const supportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.XDAI
] as const;

type SupportedBlockchain = typeof supportedBlockchains[number];

@Injectable({
  providedIn: 'root'
})
export class CoingeckoApiService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3/';

  private nativeCoinsData: Record<
    SupportedBlockchain,
    {
      coingeckoId: string;
      price: BehaviorSubject<number>;
      lastResponseTime: number;
      isRequestInProgress: boolean;
    }
  >;

  private readonly tokenBlockchainId: Record<SupportedBlockchain, string>;

  constructor(private httpClient: HttpClient) {
    const coingeckoIds: Record<SupportedBlockchain, string> = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binancecoin',
      [BLOCKCHAIN_NAME.POLYGON]: 'matic-network',
      [BLOCKCHAIN_NAME.HARMONY]: 'harmony',
      [BLOCKCHAIN_NAME.XDAI]: 'xdai'
    };

    supportedBlockchains.forEach(blockchain => {
      this.nativeCoinsData = {
        ...this.nativeCoinsData,
        [blockchain]: {
          coingeckoId: coingeckoIds[blockchain],
          price: new BehaviorSubject<number>(undefined),
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
      [BLOCKCHAIN_NAME.XDAI]: 'xdai'
    };
  }

  private isSupportedBlockchain(blockchain: BLOCKCHAIN_NAME): blockchain is SupportedBlockchain {
    return !!supportedBlockchains.find(supportedBlockchain => supportedBlockchain === blockchain);
  }

  public getNativeCoinPriceInUsdByCoingecko(
    blockchain: BLOCKCHAIN_NAME
  ): Observable<number | undefined> {
    if (!this.isSupportedBlockchain(blockchain)) {
      return of(undefined);
    }

    const nativeCoinData = this.nativeCoinsData[blockchain];
    if (nativeCoinData.isRequestInProgress) {
      return nativeCoinData.price.pipe(skip(1), first());
    }

    const requestDebounce = 13_000; // 13 seconds
    if (Date.now() - nativeCoinData.lastResponseTime <= requestDebounce) {
      return nativeCoinData.price.pipe(first());
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
          const price = +response[coingeckoId].usd;
          this.nativeCoinsData = {
            ...this.nativeCoinsData,
            [blockchain]: {
              ...nativeCoinData,
              lastResponseTime: Date.now(),
              isRequestInProgress: false
            }
          };
          nativeCoinData.price.next(price);
          return price;
        }),
        catchError(_err => {
          console.debug('Coingecko is not alive');
          return of(undefined);
        })
      );
  }

  public getTokenPrice(token: BlockchainToken): Observable<number | undefined> {
    if (token.address === NATIVE_TOKEN_ADDRESS) {
      return this.getNativeCoinPriceInUsdByCoingecko(token.blockchain);
    }

    if (!this.isSupportedBlockchain(token.blockchain)) {
      return of(undefined);
    }

    const blockchainId = this.tokenBlockchainId[token.blockchain];
    const requestTimeout = 3_000; // 3 seconds
    return this.httpClient
      .get(`${this.baseUrl}coins/${blockchainId}/contract/${token.address}`)
      .pipe(
        timeout(requestTimeout),
        map((response: { market_data: { current_price: { usd: number } } }) => {
          return response?.market_data?.current_price?.usd;
        }),
        catchError(err => {
          console.debug('Coingecko cannot retrieve token price', err);
          return of(undefined);
        })
      );
  }
}

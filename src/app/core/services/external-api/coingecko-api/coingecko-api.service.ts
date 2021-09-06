import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, first, map, skip, timeout } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

type PartialBlockchains<T> = Partial<
  {
    [blockchain in BLOCKCHAIN_NAME]: T;
  }
>;

@Injectable({
  providedIn: 'root'
})
export class CoingeckoApiService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3/';

  private readonly supportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
  ];

  private readonly tokenCoingeckoId: Partial<Record<BLOCKCHAIN_NAME, string>>;

  private readonly debounce = 13_000; // 13 seconds

  private readonly timeout = 3_000; // 3 seconds

  private nativeCoinPrice: PartialBlockchains<BehaviorSubject<number>>;

  private lastResponseTime: PartialBlockchains<number>;

  private isRequestInProgress: PartialBlockchains<boolean>;

  constructor(private httpClient: HttpClient) {
    this.tokenCoingeckoId = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binance'
    };

    this.supportedBlockchains.forEach(blockchain => {
      this.nativeCoinPrice = {
        ...this.nativeCoinPrice,
        [blockchain]: new BehaviorSubject<number>(undefined)
      };

      this.lastResponseTime = {
        ...this.lastResponseTime,
        [blockchain]: -Infinity
      };

      this.isRequestInProgress = {
        ...this.isRequestInProgress,
        [blockchain]: false
      };
    });
  }

  public async getNativeCoinPriceInUsdByCoingecko(
    blockchain: BLOCKCHAIN_NAME,
    defaultPrice = 0
  ): Promise<number> {
    if (!this.supportedBlockchains.includes(blockchain)) {
      return defaultPrice;
    }

    if (this.isRequestInProgress[blockchain]) {
      return this.nativeCoinPrice[blockchain].pipe(skip(1), first()).toPromise();
    }

    if (Date.now() - this.lastResponseTime[blockchain] <= this.debounce) {
      return this.nativeCoinPrice[blockchain].getValue();
    }

    this.isRequestInProgress[blockchain] = true;

    const tokenCoingeckoId = this.tokenCoingeckoId[blockchain];
    const price = await this.httpClient
      .get(`${this.baseUrl}simple/price`, {
        params: { ids: tokenCoingeckoId, vs_currencies: 'usd' }
      })
      .pipe(
        timeout(this.timeout),
        map((response: { [key: string]: { usd: string } }) => +response[tokenCoingeckoId].usd),
        catchError(_err => {
          console.debug('Coingecko is not alive');
          return of(defaultPrice);
        })
      )
      .toPromise();

    this.lastResponseTime[blockchain] = Date.now();
    this.isRequestInProgress[blockchain] = false;
    this.nativeCoinPrice[blockchain].next(price);

    return price;
  }
}

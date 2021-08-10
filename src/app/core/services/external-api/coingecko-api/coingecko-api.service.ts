import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, first, skip, timeout } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoingeckoApiService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3/';

  private readonly debounce = 13_000; // 13 seconds

  private readonly timeout = 3_000; // 3 seconds

  private ethPrice = new BehaviorSubject<number>(undefined);

  private lastResponseTime: number;

  private isRequestInProgress = false;

  constructor(private httpClient: HttpClient) {}

  public async getEtherPriceInUsdByCoingecko(defaultPrice: number): Promise<number> {
    if (this.isRequestInProgress) {
      return this.ethPrice.pipe(skip(1), first()).toPromise();
    }

    if (this.lastResponseTime && Date.now() - this.lastResponseTime <= this.debounce) {
      return this.ethPrice.getValue();
    }

    this.isRequestInProgress = true;

    const tokenCoingeckoId = 'ethereum';
    const response = await this.httpClient
      .get(`${this.baseUrl}simple/price`, {
        params: { ids: tokenCoingeckoId, vs_currencies: 'usd' }
      })
      .pipe(
        timeout(this.timeout),
        catchError(_err => {
          console.debug('Coingecko is not alive');
          return of(defaultPrice);
        })
      )
      .toPromise();
    const price = +response[tokenCoingeckoId].usd;

    this.lastResponseTime = Date.now();
    this.isRequestInProgress = false;
    this.ethPrice.next(price);

    return price;
  }
}

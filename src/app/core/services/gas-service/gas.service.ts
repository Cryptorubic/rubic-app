import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap, timeout } from 'rxjs/operators';
import { PolygonGasResponse } from 'src/app/core/services/gas-service/models/polygon-gas-response';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';

interface NetworksGasPrice<T> {
  [BLOCKCHAIN_NAME.ETHEREUM]: T;
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: T;
  [BLOCKCHAIN_NAME.POLYGON]: T;
}

@Injectable({
  providedIn: 'root'
})
export class GasService {
  /**
   * Gas price functions for different networks.
   */
  private readonly gasPriceFunctions: NetworksGasPrice<() => Observable<number | null>>;

  /**
   * Current gas price subject.
   */
  private readonly currentNetworkGasPrice$: BehaviorSubject<number>;

  /**
   * Gas price update interval in seconds.
   */
  private readonly requestInterval: number;

  /**
   * Gas price for current network.
   */
  public get gasPrice(): Observable<number> {
    return this.currentNetworkGasPrice$.asObservable();
  }

  constructor(private readonly httpClient: HttpClient) {
    this.requestInterval = 15_000;
    this.currentNetworkGasPrice$ = new BehaviorSubject<number>(null);
    this.gasPriceFunctions = {
      [BLOCKCHAIN_NAME.ETHEREUM]: this.fetchEthGas.bind(this),
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.fetchBscGas.bind(this),
      [BLOCKCHAIN_NAME.POLYGON]: this.fetchPolygonGas.bind(this)
    };
    this.fetchGas();
  }

  /**
   * Fetches gas in current network.
   */
  public fetchGas(): void {
    const timer$ = timer(0, this.requestInterval);
    timer$
      .pipe(
        switchMap(() => {
          return this.gasPriceFunctions[BLOCKCHAIN_NAME.ETHEREUM]();
        })
      )
      .subscribe((gasPrice: number | null) => {
        if (gasPrice) {
          this.currentNetworkGasPrice$.next(gasPrice);
        }
      });
  }

  /**
   * Gets ETH gas from different APIs, sorted by priority, in case of errors.
   * @return Observable<number> Average gas price.
   */
  private fetchEthGas(): Observable<number | null> {
    const requestTimeout = 2000;
    return this.httpClient.get('https://gas-price-api.1inch.io/v1.2/1').pipe(
      timeout(requestTimeout),
      map((response: { medium: { maxFeePerGas: string } }) =>
        new BigNumber(response.medium.maxFeePerGas)
          .dividedBy(10 ** 9)
          .dp(0)
          .toNumber()
      ),
      catchError(() =>
        this.httpClient.get('https://www.gasnow.org/api/v3/gas/price').pipe(
          timeout(requestTimeout),
          map((response: { data: { fast: string } }) =>
            new BigNumber(response.data.fast)
              .dividedBy(10 ** 9)
              .dp(0)
              .toNumber()
          )
        )
      ),
      catchError(() =>
        this.httpClient.get('https://ethgasstation.info/api/ethgasAPI.json').pipe(
          timeout(requestTimeout),
          map((response: { average: number }) => response.average / 10)
        )
      ),
      catchError(() => of(null))
    );
  }

  /**
   * Gets BSC gas.
   * @return Observable<number> Average gas price.
   */
  private fetchBscGas(): Observable<number> {
    return of(5);
  }

  /**
   * Gets Polygon gas from gas station api.
   * @return Observable<number> Average gas price.
   */
  private fetchPolygonGas(): Observable<number | null> {
    return this.httpClient.get('https://gasstation-mainnet.matic.network/').pipe(
      map((el: PolygonGasResponse) => Math.floor(el.standard)),
      catchError(() => of(null))
    );
  }
}

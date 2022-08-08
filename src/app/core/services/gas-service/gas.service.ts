import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap, timeout } from 'rxjs/operators';
import { PolygonGasResponse } from 'src/app/core/services/gas-service/models/polygon-gas-response';
import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ts-cacheable';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';

const supportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.AVALANCHE,
  BLOCKCHAIN_NAME.TELOS,
  BLOCKCHAIN_NAME.FANTOM
] as const;

type SupportedBlockchain = typeof supportedBlockchains[number];

type NetworksGasPrice<T> = Record<SupportedBlockchain, T>;

@Injectable({
  providedIn: 'root'
})
export class GasService {
  /**
   * Gas price request interval in seconds.
   */
  private static readonly requestInterval = 15_000;

  /**
   * Gas price functions for different networks.
   */
  private readonly gasPriceFunctions: NetworksGasPrice<() => Observable<number | null>>;

  /**
   * Gas price in Gwei subject.
   */
  private readonly networkGasPrice$: NetworksGasPrice<BehaviorSubject<number | null>>;

  /**
   * Gas price update interval in seconds.
   */
  private readonly updateInterval: number;

  private static isSupportedBlockchain(
    blockchain: BlockchainName
  ): blockchain is SupportedBlockchain {
    return supportedBlockchains.some(supBlockchain => supBlockchain === blockchain);
  }

  constructor(private readonly httpClient: HttpClient) {
    this.updateInterval = 15_000;

    this.networkGasPrice$ = {
      [BLOCKCHAIN_NAME.ETHEREUM]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.POLYGON]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.AVALANCHE]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.TELOS]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.FANTOM]: new BehaviorSubject(null)
    };
    this.gasPriceFunctions = {
      [BLOCKCHAIN_NAME.ETHEREUM]: this.fetchEthGas.bind(this),
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.fetchBscGas.bind(this),
      [BLOCKCHAIN_NAME.POLYGON]: this.fetchPolygonGas.bind(this),
      [BLOCKCHAIN_NAME.AVALANCHE]: this.fetchAvalancheGas.bind(this),
      [BLOCKCHAIN_NAME.TELOS]: this.fetchTelosGas.bind(this),
      [BLOCKCHAIN_NAME.FANTOM]: this.fetchFantomGas.bind(this)
    };

    this.setIntervalOnGasPriceRefreshing();
  }

  /**
   * Gas price in Gwei for selected blockchain as observable.
   * @param blockchain Blockchain to get gas price from.
   */
  public getGasPrice$(blockchain: BlockchainName): Observable<number | null> {
    if (!GasService.isSupportedBlockchain(blockchain)) {
      throw Error('Not supported blockchain');
    }
    return this.networkGasPrice$[blockchain].asObservable();
  }

  /**
   * Gas price in Eth units for selected blockchain.
   * @param blockchain Blockchain to get gas price from.
   */
  public async getGasPriceInEthUnits(blockchain: BlockchainName): Promise<BigNumber> {
    if (!GasService.isSupportedBlockchain(blockchain)) {
      throw Error('Not supported blockchain');
    }
    return new BigNumber(await this.gasPriceFunctions[blockchain]().toPromise()).dividedBy(10 ** 9);
  }

  /**
   * Updates gas price in interval.
   */
  private setIntervalOnGasPriceRefreshing(): void {
    const timer$ = timer(0, this.updateInterval);
    timer$
      .pipe(
        switchMap(() => {
          return this.gasPriceFunctions[BLOCKCHAIN_NAME.ETHEREUM]();
        })
      )
      .subscribe((ethGasPrice: number | null) => {
        if (ethGasPrice) {
          this.networkGasPrice$[BLOCKCHAIN_NAME.ETHEREUM].next(ethGasPrice);
        }
      });
  }

  /**
   * Gets ETH gas from different APIs, sorted by priority, in case of errors.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
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
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchBscGas(): Observable<number> {
    return of(5);
  }

  /**
   * Gets Polygon gas from gas station api.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchPolygonGas(): Observable<number | null> {
    return this.httpClient.get('https://gasstation-mainnet.matic.network/').pipe(
      map((el: PolygonGasResponse) => Math.floor(el.standard)),
      catchError(() => of(null))
    );
  }

  /**
   * Gets Avalanche gas from gas station api.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchAvalancheGas(): Observable<number | null> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.AVALANCHE);
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return new BigNumber(gasPriceInWei).dividedBy(10 ** 9).toNumber();
      })
    );
  }

  /**
   * Gets Telos gas from gas station api.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchTelosGas(): Observable<number | null> {
    return of(500);
  }

  /**
   * Gets Fantom gas from gas station api.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchFantomGas(): Observable<number | null> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.FANTOM);
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return new BigNumber(gasPriceInWei).dividedBy(10 ** 9).toNumber();
      })
    );
  }
}

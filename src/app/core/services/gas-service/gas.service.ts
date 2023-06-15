import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap, timeout } from 'rxjs/operators';
import { PolygonGasResponse } from 'src/app/core/services/gas-service/models/polygon-gas-response';
import { BlockchainName, BLOCKCHAIN_NAME, Injector, GasPrice, Web3Pure } from 'rubic-sdk';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ts-cacheable';
import { formatEIP1559Gas } from '@app/shared/utils/utils';
import { OneInchGasResponse } from './models/1inch-gas-response';
import { shouldCalculateGas } from '@app/shared/models/blockchain/should-calculate-gas';
import { GasInfo } from './models/gas-info';

const supportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.AVALANCHE,
  BLOCKCHAIN_NAME.TELOS,
  BLOCKCHAIN_NAME.FANTOM,
  BLOCKCHAIN_NAME.ETHEREUM_POW,
  BLOCKCHAIN_NAME.OPTIMISM,
  BLOCKCHAIN_NAME.ARBITRUM,
  BLOCKCHAIN_NAME.ZK_SYNC
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
  private readonly gasPriceFunctions: NetworksGasPrice<() => Observable<GasPrice | null>>;

  /**
   * Gas price in Gwei subject.
   */
  private readonly networkGasPrice$: NetworksGasPrice<BehaviorSubject<GasPrice | null>>;

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
      [BLOCKCHAIN_NAME.FANTOM]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.ETHEREUM_POW]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.OPTIMISM]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.ARBITRUM]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.ZK_SYNC]: new BehaviorSubject(null)
    };
    this.gasPriceFunctions = {
      [BLOCKCHAIN_NAME.ETHEREUM]: this.fetchEthGas.bind(this),
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.fetchBscGas.bind(this),
      [BLOCKCHAIN_NAME.POLYGON]: this.fetchPolygonGas.bind(this),
      [BLOCKCHAIN_NAME.AVALANCHE]: this.fetchAvalancheGas.bind(this),
      [BLOCKCHAIN_NAME.TELOS]: this.fetchTelosGas.bind(this),
      [BLOCKCHAIN_NAME.FANTOM]: this.fetchFantomGas.bind(this),
      [BLOCKCHAIN_NAME.ETHEREUM_POW]: this.fetchEthereumPowGas.bind(this),
      [BLOCKCHAIN_NAME.OPTIMISM]: this.fetchOptimismGas.bind(this),
      [BLOCKCHAIN_NAME.ARBITRUM]: this.fetchArbitrumGas.bind(this),
      [BLOCKCHAIN_NAME.ZK_SYNC]: this.fetchZkSyncGas.bind(this)
    };

    this.setIntervalOnGasPriceRefreshing();
  }

  /**
   * Gas price in Gwei for selected blockchain as observable.
   * @param blockchain Blockchain to get gas price from.
   */
  public getGasPrice$(blockchain: BlockchainName): Observable<GasPrice | null> {
    if (!GasService.isSupportedBlockchain(blockchain)) {
      throw Error('Not supported blockchain');
    }
    return this.networkGasPrice$[blockchain].asObservable();
  }

  /**
   * Gas price in Eth units for selected blockchain.
   * @param blockchain Blockchain to get gas price from.
   */
  public async getGasPriceInEthUnits(blockchain: BlockchainName): Promise<GasPrice> {
    if (!GasService.isSupportedBlockchain(blockchain)) {
      throw Error('Not supported blockchain');
    }
    const { gasPrice, baseFee, maxFeePerGas, maxPriorityFeePerGas } = await this.gasPriceFunctions[
      blockchain
    ]().toPromise();

    return {
      gasPrice,
      baseFee,
      maxFeePerGas,
      maxPriorityFeePerGas
    };
  }

  /**
   * Provides gas info for a given blockchain
   * @param blockchain Blockchain to get gas info.
   */
  public async getGasInfo(blockchain: BlockchainName): Promise<GasInfo> {
    const shouldCalculateGasPrice = shouldCalculateGas[blockchain];

    if (!shouldCalculateGasPrice) {
      return { shouldCalculateGasPrice, gasPriceOptions: {} };
    }

    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPriceInEthUnits(
      blockchain
    );

    const gasPriceOptions = Boolean(maxPriorityFeePerGas)
      ? {
          maxPriorityFeePerGas: Web3Pure.toWei(maxPriorityFeePerGas, 9),
          maxFeePerGas: Web3Pure.toWei(maxFeePerGas, 9)
        }
      : {
          gasPrice: Web3Pure.toWei(gasPrice)
        };

    return { shouldCalculateGasPrice, gasPriceOptions };
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
      .subscribe((ethGasPrice: GasPrice | null) => {
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
  private fetchEthGas(): Observable<GasPrice | null> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ETHEREUM);
    const requestTimeout = 2000;
    return this.httpClient.get<OneInchGasResponse>('https://gas-price-api.1inch.io/v1.2/1').pipe(
      timeout(requestTimeout),
      map(response => ({
        baseFee: response.baseFee,
        maxFeePerGas: new BigNumber(response.high.maxFeePerGas).multipliedBy(1.25).toFixed(),
        maxPriorityFeePerGas: response.high.maxPriorityFeePerGas
      })),
      catchError(() => blockchainAdapter.getPriorityFeeGas()),
      map(formatEIP1559Gas)
    );
  }

  /**
   * Gets BSC gas.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchBscGas(): Observable<GasPrice> {
    return of({
      gasPrice: new BigNumber(5).dividedBy(10 ** 9).toFixed()
    });
  }

  /**
   * Gets Polygon gas from gas station api.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchPolygonGas(): Observable<GasPrice | null> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.POLYGON);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      catchError(() => {
        return this.httpClient.get('https://gasstation-mainnet.matic.network/').pipe(
          map((el: PolygonGasResponse) => ({
            gasPrice: Math.floor(el.standard).toFixed()
          }))
        );
      }),
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
  private fetchAvalancheGas(): Observable<GasPrice | null> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.AVALANCHE);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      catchError(() => of(null))
    );
  }

  /**
   * Gets Telos gas from gas station api.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchTelosGas(): Observable<GasPrice | null> {
    return of({
      gasPrice: new BigNumber(510).dividedBy(10 ** 9).toFixed()
    });
  }

  /**
   * Gets Fantom gas from gas statнion api.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchFantomGas(): Observable<GasPrice | null> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.FANTOM);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      catchError(() => of(null))
    );
  }

  /**
   * Gets Ethereum PoW gas from blockchain.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchEthereumPowGas(): Observable<GasPrice | null> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.ETHEREUM_POW
    );
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 9).toFixed()
        };
      })
    );
  }

  /**
   * Gets Optimism gas.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchOptimismGas(): Observable<GasPrice> {
    return of({
      gasPrice: new BigNumber(500).dividedBy(10 ** 9).toFixed()
    });
  }

  /**
   * Gets Arbitrum gas from blockchain.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchArbitrumGas(): Observable<GasPrice | null> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ARBITRUM);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      catchError(() => of(null))
    );
  }

  /**
   * Gets ZkSync gas.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchZkSyncGas(): Observable<GasPrice> {
    return of({
      gasPrice: new BigNumber(0.25).dividedBy(10 ** 9).toFixed()
    });
  }
}

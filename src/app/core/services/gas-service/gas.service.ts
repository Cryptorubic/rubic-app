import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap, timeout } from 'rxjs/operators';
import { PolygonGasResponse } from 'src/app/core/services/gas-service/models/polygon-gas-response';
import { BLOCKCHAIN_NAME, BlockchainName, GasPrice, Injector, Web3Pure } from 'rubic-sdk';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ts-cacheable';
import { formatEIP1559Gas } from '@app/shared/utils/utils';
import { OneInchGasResponse } from './models/1inch-gas-response';
import { shouldCalculateGas } from '@app/shared/models/blockchain/should-calculate-gas';
import { GasInfo } from './models/gas-info';
import { MetaMaskGasResponse } from './models/metamask-gas-response';
import { calculateAverageValue, calculateDeviation } from '@app/shared/utils/gas-price-deviation';

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
  BLOCKCHAIN_NAME.ZK_SYNC,
  BLOCKCHAIN_NAME.LINEA,
  BLOCKCHAIN_NAME.BASE
] as const;

type SupportedBlockchain = (typeof supportedBlockchains)[number];

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
      [BLOCKCHAIN_NAME.ZK_SYNC]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.LINEA]: new BehaviorSubject(null),
      [BLOCKCHAIN_NAME.BASE]: new BehaviorSubject(null)
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
      [BLOCKCHAIN_NAME.ZK_SYNC]: this.fetchZkSyncGas.bind(this),
      [BLOCKCHAIN_NAME.LINEA]: this.fetchLineaGas.bind(this),
      [BLOCKCHAIN_NAME.BASE]: this.fetchBaseGas.bind(this)
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

    const oneInchEstimation$ = this.httpClient
      .get<OneInchGasResponse>('https://api.1inch.dev/gas-price/v1.4/1', {
        headers: { Authorization: `Bearer Xm2RjvwebukwFWf0XqTzqbmB0u91Gwwb` }
      })
      .pipe(
        timeout(requestTimeout),
        map(response => ({
          baseFee: response.baseFee,
          maxFeePerGas: response.high.maxFeePerGas,
          maxPriorityFeePerGas: response.high.maxPriorityFeePerGas
        })),
        catchError(() => of(null))
      );
    const metamaskEstimation$ = this.httpClient
      .get<MetaMaskGasResponse>(
        'https://gas-api.metaswap.codefi.network/networks/1/suggestedGasFees'
      )
      .pipe(
        timeout(requestTimeout),
        map(response => ({
          baseFee: Web3Pure.toWei(response.estimatedBaseFee, 9),
          maxFeePerGas: Web3Pure.toWei(response.low.suggestedMaxFeePerGas, 9),
          maxPriorityFeePerGas: Web3Pure.toWei(response.low.suggestedMaxPriorityFeePerGas, 9)
        })),
        catchError(() => of(null))
      );

    const web3Estimation$ = from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(response => ({
        ...response,
        maxFeePerGas: new BigNumber(response.maxFeePerGas).multipliedBy(0.8).toFixed()
      }))
    );

    return forkJoin([oneInchEstimation$, metamaskEstimation$, web3Estimation$]).pipe(
      map(estimations => this.getAverageGasPrice(estimations.filter(Boolean))),
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
   * Gets Optimism gas from blockchain.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchOptimismGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.OPTIMISM);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      catchError(() => of(null))
    );
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

  /**
   * Gets Linea gas from blockchain.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchLineaGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.LINEA);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      map(gasOptions => ({
        ...gasOptions,
        maxFeePerGas: new BigNumber(gasOptions.maxFeePerGas).multipliedBy(1.3).toFixed()
      })),
      catchError(() => of(null))
    );
  }

  /**
   * Gets Base gas from blockchain.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchBaseGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.BASE);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      catchError(() => of(null))
    );
  }

  /**
   * Calculates average gas price, with taking standard deviation into account
   * @param estimations Gas price estimations from different sources
   * @returns Average EIP-1559 compatible gas price values
   */
  public getAverageGasPrice(estimations: GasPrice[]): GasPrice {
    if (estimations.length === 1) {
      return estimations[0];
    }

    const [baseFees, maxFeesPerGas, maxPriorityFeesPerGas] = [
      estimations.map(estimation => Number(estimation.baseFee)),
      estimations.map(estimation => Number(estimation.maxFeePerGas)),
      estimations.map(estimation => Number(estimation.maxPriorityFeePerGas))
    ];

    const baseFeeDeviation = calculateDeviation(baseFees);
    const baseFee = calculateAverageValue(baseFees, baseFeeDeviation);

    const maxPriorityFeePerGasDeviation = calculateDeviation(maxPriorityFeesPerGas);
    const maxPriorityFeePerGas = calculateAverageValue(
      maxPriorityFeesPerGas,
      maxPriorityFeePerGasDeviation
    );

    const maxFeePerGasDeviation = calculateDeviation(maxFeesPerGas);
    const expectedMaxFeePerGas = calculateAverageValue(maxFeesPerGas, maxFeePerGasDeviation);

    const maxFeePerGas =
      expectedMaxFeePerGas < baseFee
        ? new BigNumber(baseFee).multipliedBy(1.25).plus(maxPriorityFeePerGas).toFixed()
        : expectedMaxFeePerGas;

    return { baseFee, maxFeePerGas, maxPriorityFeePerGas };
  }
}

import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
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
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';

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
  BLOCKCHAIN_NAME.BASE,
  BLOCKCHAIN_NAME.MANTLE,
  BLOCKCHAIN_NAME.POLYGON_ZKEVM,
  BLOCKCHAIN_NAME.SCROLL,
  BLOCKCHAIN_NAME.MANTA_PACIFIC,
  BLOCKCHAIN_NAME.BLAST,
  BLOCKCHAIN_NAME.KROMA,
  BLOCKCHAIN_NAME.MERLIN,
  BLOCKCHAIN_NAME.MODE,
  BLOCKCHAIN_NAME.ZK_LINK,
  BLOCKCHAIN_NAME.TAIKO,
  BLOCKCHAIN_NAME.ROOTSTOCK,
  BLOCKCHAIN_NAME.SEI,
  BLOCKCHAIN_NAME.BITLAYER,
  BLOCKCHAIN_NAME.GRAVITY,
  BLOCKCHAIN_NAME.FRAXTAL,
  BLOCKCHAIN_NAME.BERACHAIN,
  // BLOCKCHAIN_NAME.SONIC,
  // BLOCKCHAIN_NAME.MORPH,
  BLOCKCHAIN_NAME.SONEIUM,
  BLOCKCHAIN_NAME.UNICHAIN
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
  private readonly gasPriceFunctions: NetworksGasPrice<() => Observable<GasPrice | null>> = {
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
    [BLOCKCHAIN_NAME.BASE]: this.fetchBaseGas.bind(this),
    [BLOCKCHAIN_NAME.MANTLE]: this.fetchMantleGas.bind(this),
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: this.fetchPolygonZkEvmGas.bind(this),
    [BLOCKCHAIN_NAME.SCROLL]: this.fetchScrollGas.bind(this),
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: this.fetchMantaPacificGas.bind(this),
    [BLOCKCHAIN_NAME.BLAST]: this.fetchBlastGas.bind(this),
    [BLOCKCHAIN_NAME.KROMA]: this.fetchKromaGas.bind(this),
    [BLOCKCHAIN_NAME.MERLIN]: this.fetchMerlinGas.bind(this),
    [BLOCKCHAIN_NAME.MODE]: this.fetchModeGas.bind(this),
    [BLOCKCHAIN_NAME.ZK_LINK]: this.fetchZkLinkGas.bind(this),
    [BLOCKCHAIN_NAME.TAIKO]: this.fetchTaikoGas.bind(this),
    [BLOCKCHAIN_NAME.ROOTSTOCK]: this.fetchRootstockGas.bind(this),
    [BLOCKCHAIN_NAME.SEI]: this.fetchSeiGas.bind(this),
    [BLOCKCHAIN_NAME.BITLAYER]: this.fetchBitlayerGas.bind(this),
    [BLOCKCHAIN_NAME.GRAVITY]: this.fetchGravityGas.bind(this),
    // [BLOCKCHAIN_NAME.SONIC]: this.fetchSonicGas.bind(this),
    // [BLOCKCHAIN_NAME.MORPH]: this.fetchMorphGas.bind(this),
    [BLOCKCHAIN_NAME.FRAXTAL]: this.fetchFraxtalGas.bind(this),
    [BLOCKCHAIN_NAME.BERACHAIN]: this.fetchBerachainGas.bind(this),
    [BLOCKCHAIN_NAME.SONEIUM]: this.fetchSoneiumGas.bind(this),
    [BLOCKCHAIN_NAME.UNICHAIN]: this.fetchUnichainGas.bind(this)
  };

  private static isSupportedBlockchain(
    blockchain: BlockchainName
  ): blockchain is SupportedBlockchain {
    return supportedBlockchains.some(supBlockchain => supBlockchain === blockchain);
  }

  constructor(
    private readonly httpClient: HttpClient,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

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
    const isSafeSdk = this.walletConnectorService.checkIfSafeEnv();
    if (isSafeSdk) {
      return {
        shouldCalculateGasPrice: false,
        gasPriceOptions: {
          maxFeePerGas: undefined,
          maxPriorityFeePerGas: undefined
        }
      };
    }
    const shouldCalculateGasPrice = shouldCalculateGas[blockchain];

    if (!shouldCalculateGasPrice) {
      return { shouldCalculateGasPrice, gasPriceOptions: {} };
    }

    const gasResult = await this.getGasPriceInEthUnits(blockchain);
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = gasResult;

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
      .get<OneInchGasResponse>('https://x-api.rubic.exchange/api/gas-price/v1.4/1', {
        headers: { apikey: 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4' }
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
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        const gasPriceinGwei = new BigNumber(gasPriceInWei).dividedBy(10 ** 9);
        if (gasPriceinGwei.lt(1)) {
          return {
            gasPrice: new BigNumber(1).dividedBy(10 ** 9).toFixed()
          };
        }
        return {
          gasPrice: gasPriceinGwei.dividedBy(10 ** 9).toFixed()
        };
      })
    );
  }

  // 508281 BNB
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
   * Gets Avalanche gas from gas station api.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchUnichainGas(): Observable<GasPrice | null> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.UNICHAIN);
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

  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchKromaGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.KROMA);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      map(gasInfo => ({
        ...gasInfo,
        maxFeePerGas: new BigNumber(2.5).multipliedBy(gasInfo.maxFeePerGas).toFixed()
      })),
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
   * Gets Mantle gas from blockchain.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchMantleGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.MANTLE);
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
        };
      })
    );
  }

  /**
   * Gets Manta Pacific gas from blockchain.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchMantaPacificGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.MANTA_PACIFIC
    );
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
        };
      })
    );
  }

  /**
   * Gets Scroll gas from blockchain.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchScrollGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SCROLL);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      catchError(() => of(null))
    );
  }

  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchBlastGas(): Observable<GasPrice | null> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.BLAST);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      catchError(() => of(null))
    );
  }

  /**
   * Gets Polygon-zkEVM gas from blockchain.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchPolygonZkEvmGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.POLYGON_ZKEVM
    );
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
        };
      })
    );
  }

  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchMerlinGas(): Observable<GasPrice> {
    return of({
      gasPrice: new BigNumber(0.065).dividedBy(10 ** 9).toFixed()
    });
  }

  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchModeGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.MODE);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      catchError(() => of(null))
    );
  }

  /**
   * Gets ZkLink gas.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchZkLinkGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZK_LINK);
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
        };
      })
    );
  }

  /**
   * Gets Taiko gas.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchTaikoGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TAIKO);
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
        };
      })
    );
  }

  /**
   * Gets Rootstock gas.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchRootstockGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ROOTSTOCK);
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
        };
      })
    );
  }

  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchSeiGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SEI);
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
        };
      })
    );
  }

  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchGravityGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.GRAVITY);
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
        };
      })
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

  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchBitlayerGas(): Observable<GasPrice | null> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.BITLAYER);
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
        };
      })
    );
  }

  // @Cacheable({
  //   maxAge: GasService.requestInterval
  // })
  // private fetchSonicGas(): Observable<GasPrice | null> {
  //   const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SONIC);
  //   return from(blockchainAdapter.getGasPrice()).pipe(
  //     map((gasPriceInWei: string) => {
  //       return {
  //         gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
  //       };
  //     })
  //   );
  // }

  // @Cacheable({
  //   maxAge: GasService.requestInterval
  // })
  // private fetchMorphGas(): Observable<GasPrice> {
  //   const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.MORPH);
  //   return from(blockchainAdapter.getPriorityFeeGas()).pipe(
  //     map(formatEIP1559Gas),
  //     catchError(() => of(null))
  //   );
  // }

  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchFraxtalGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.FRAXTAL);
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
        };
      })
    );
  }

  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchBerachainGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.BERACHAIN);
    return from(blockchainAdapter.getGasPrice()).pipe(
      map((gasPriceInWei: string) => {
        return {
          gasPrice: new BigNumber(gasPriceInWei).dividedBy(10 ** 18).toFixed()
        };
      })
    );
  }

  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchSoneiumGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SONEIUM);
    return from(blockchainAdapter.getPriorityFeeGas()).pipe(
      map(formatEIP1559Gas),
      catchError(() => of(null))
    );
  }
}

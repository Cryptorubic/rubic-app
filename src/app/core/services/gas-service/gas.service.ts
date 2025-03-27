import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BLOCKCHAIN_NAME, BlockchainName, GasPrice, Injector, Web3Pure } from 'rubic-sdk';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ts-cacheable';
import { shouldCalculateGas } from '@app/shared/models/blockchain/should-calculate-gas';
import { GasInfo } from './models/gas-info';
import { calculateAverageValue, calculateDeviation } from '@app/shared/utils/gas-price-deviation';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';

const supportedBlockchains = [BLOCKCHAIN_NAME.MEGAETH_TESTNET] as const;

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
    [BLOCKCHAIN_NAME.MEGAETH_TESTNET]: this.fetchMegaEthGas.bind(this)
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
   * Gets Taiko gas.
   * @return Observable<number> Average gas price in Gwei.
   */
  @Cacheable({
    maxAge: GasService.requestInterval
  })
  private fetchMegaEthGas(): Observable<GasPrice> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.MEGAETH_TESTNET
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

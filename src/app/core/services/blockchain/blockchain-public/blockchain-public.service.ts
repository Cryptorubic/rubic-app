import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { first, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, from, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import ConnectionLink from 'src/app/core/services/blockchain/models/ConnectionLink';
import { Web3Public } from 'src/app/core/services/blockchain/blockchain-adapters/web3/web3-public';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import {
  BlockchainPublicAdapter,
  WEB3_ETH_SUPPORTED_BLOCKCHAINS,
  Web3EthSupportedBlockchains
} from 'src/app/core/services/blockchain/blockchain-public/types';
import networks from 'src/app/shared/constants/blockchain/networks';
import BigNumber from 'bignumber.js';

@Injectable({
  providedIn: 'root'
})
export class BlockchainPublicService {
  private readonly nodeCheckedSubject$ = new BehaviorSubject<boolean>(false);

  private readonly connectionLinks: ConnectionLink[];

  public readonly adapters: { [T in BLOCKCHAIN_NAME]: BlockchainPublicAdapter };

  static toWei(amount: BigNumber | string | number, decimals = 18): string {
    return new BigNumber(amount || 0).times(new BigNumber(10).pow(decimals)).toFixed(0);
  }

  static fromWei(amountInWei: BigNumber | string | number, decimals = 18): BigNumber {
    return new BigNumber(amountInWei).div(new BigNumber(10).pow(decimals));
  }

  static isEthLikeBlockchain(blockchain: BLOCKCHAIN_NAME): boolean {
    const ethLikeBlockchain = [
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON,
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
      BLOCKCHAIN_NAME.HARMONY,
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
      BLOCKCHAIN_NAME.POLYGON_TESTNET,
      BLOCKCHAIN_NAME.HARMONY_TESTNET,
      BLOCKCHAIN_NAME.AVALANCHE,
      BLOCKCHAIN_NAME.AVALANCHE_TESTNET
    ];
    return ethLikeBlockchain.includes(blockchain);
  }

  constructor(
    private readonly useTestingModeService: UseTestingModeService,
    private readonly httpClient: HttpClient
  ) {
    this.connectionLinks = networks.map(network => ({
      blockchainName: network.name,
      rpcLink: network.rpcLink,
      additionalRpcLink: network.additionalRpcLink
    }));

    this.adapters = Object.fromEntries(
      Object.values(BLOCKCHAIN_NAME).map(blockchain => [blockchain, null])
    ) as { [T in BLOCKCHAIN_NAME]: BlockchainPublicAdapter };

    this.connectionLinks = this.connectionLinks.filter(connection =>
      WEB3_ETH_SUPPORTED_BLOCKCHAINS.includes(
        connection.blockchainName as Web3EthSupportedBlockchains
      )
    );
    this.connectionLinks.forEach(connection =>
      this.initiateAdapter(connection.rpcLink, connection.blockchainName)
    );

    this.checkAllRpcProviders();

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.connectionLinks.forEach(connection => {
          const testingConnection = this.connectionLinks.find(
            c => c.blockchainName === `${connection.blockchainName}_TESTNET`
          );
          if (!testingConnection) {
            return;
          }

          this.adapters[connection.blockchainName] = new Web3Public(
            new Web3(testingConnection.rpcLink),
            BlockchainsInfo.getBlockchainByName(testingConnection.blockchainName),
            this.useTestingModeService,
            this.httpClient
          );
        });
      }
    });

    this.useTestingModeService.web3PublicSettings.rpcTimeout.subscribe(
      this.checkAllRpcProviders.bind(this)
    );
  }

  /**
   * Checks all RPC providers for operability.
   */
  private checkAllRpcProviders(): void {
    const web3List = WEB3_ETH_SUPPORTED_BLOCKCHAINS.map(key => this.adapters[key]).filter(i => i);

    forkJoin(web3List.map(el => this.nodeHealthCheck(el as Web3Public))).subscribe(() =>
      this.nodeCheckedSubject$.next(true)
    );
  }

  /**
   * Checks a node for operability.
   * @param web3Public Adapter public interface.
   * @param timeout Timeout to interact.
   * @returns Observable<boolean> Is node alive or not.
   */
  private nodeHealthCheck(web3Public: Web3Public, timeout?: number): Observable<boolean> {
    return web3Public.healthCheck(timeout).pipe(
      tap(isNodeWorks => {
        if (isNodeWorks === null) {
          return;
        }

        const blockchainName = web3Public.blockchain.name as Web3EthSupportedBlockchains;
        const connector = this.connectionLinks.find(item => item.blockchainName === blockchainName);
        if (!isNodeWorks && connector?.additionalRpcLink) {
          this.adapters[blockchainName].setProvider(connector.additionalRpcLink);

          console.debug(
            `Broken ${web3Public.blockchain.label} node has been replaced with a spare.`
          );
        }
      })
    );
  }

  /**
   * Initiates blockchain adapter based on blockchain and node operability.
   * @param rpcLink RPC url address.
   * @param blockchainName Name of blockchain.
   */
  private initiateAdapter(rpcLink: string, blockchainName: BLOCKCHAIN_NAME): void {
    const ethereumBlockchainPublicAdapter = new Web3Public(
      new Web3(rpcLink),
      BlockchainsInfo.getBlockchainByName(blockchainName),
      this.useTestingModeService,
      this.httpClient
    );

    const nodesChecked$ = this.nodeCheckedSubject$.asObservable();
    const whiteListMethods = ['healthCheck', 'setProvider', 'isNativeAddress', 'isAddressCorrect'];
    this.adapters[blockchainName] = new Proxy(ethereumBlockchainPublicAdapter, {
      get(target: BlockchainPublicAdapter, prop: keyof BlockchainPublicAdapter) {
        if (typeof target[prop] === 'function' && whiteListMethods.includes(prop)) {
          return (target[prop] as Function).bind(target);
        }

        if (typeof target[prop] === 'function') {
          return (...params: unknown[]) =>
            nodesChecked$
              .pipe(
                first(value => value),
                switchMap(() => from((target[prop] as Function).call(target, ...params)))
              )
              .toPromise();
        }

        return target[prop];
      }
    });
  }
}

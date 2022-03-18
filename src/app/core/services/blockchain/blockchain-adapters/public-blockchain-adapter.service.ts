import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { first, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import ConnectionLink from '@core/services/blockchain/models/connection-link';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { UseTestingModeService } from '@core/services/use-testing-mode/use-testing-mode.service';
import networks from '@shared/constants/blockchain/networks';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { Connection } from '@solana/web3.js';
import { NearWeb3Public } from '@core/services/blockchain/blockchain-adapters/near/near-web3-public';
import { NEAR_MAINNET_CONFIG } from '@core/services/blockchain/blockchain-adapters/near/near-config';

export const WEB3_SUPPORTED_BLOCKCHAINS = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.AVALANCHE,
  BLOCKCHAIN_NAME.MOONRIVER,
  BLOCKCHAIN_NAME.FANTOM,
  BLOCKCHAIN_NAME.ARBITRUM,
  BLOCKCHAIN_NAME.AURORA
] as const;

export type Web3SupportedBlockchains = typeof WEB3_SUPPORTED_BLOCKCHAINS[number];

@Injectable({
  providedIn: 'root'
})
export class PublicBlockchainAdapterService {
  private readonly _nodesChecked$ = new BehaviorSubject<boolean>(false);

  private connectionLinks: ConnectionLink[];

  public [BLOCKCHAIN_NAME.ETHEREUM]: EthLikeWeb3Public;

  public [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: EthLikeWeb3Public;

  public [BLOCKCHAIN_NAME.POLYGON]: EthLikeWeb3Public;

  public [BLOCKCHAIN_NAME.HARMONY]: EthLikeWeb3Public;

  public [BLOCKCHAIN_NAME.AVALANCHE]: EthLikeWeb3Public;

  public [BLOCKCHAIN_NAME.MOONRIVER]: EthLikeWeb3Public;

  public [BLOCKCHAIN_NAME.FANTOM]: EthLikeWeb3Public;

  public [BLOCKCHAIN_NAME.ARBITRUM]: EthLikeWeb3Public;

  public [BLOCKCHAIN_NAME.AURORA]: EthLikeWeb3Public;

  public readonly [BLOCKCHAIN_NAME.XDAI]: EthLikeWeb3Public = null;

  public [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: EthLikeWeb3Public = null;

  public [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: EthLikeWeb3Public = null;

  public readonly [BLOCKCHAIN_NAME.POLYGON_TESTNET]: EthLikeWeb3Public = null;

  public readonly [BLOCKCHAIN_NAME.HARMONY_TESTNET]: EthLikeWeb3Public = null;

  public readonly [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: EthLikeWeb3Public = null;

  public readonly [BLOCKCHAIN_NAME.AURORA_TESTNET]: EthLikeWeb3Public = null;

  public [BLOCKCHAIN_NAME.SOLANA]: SolanaWeb3Public = null;

  public [BLOCKCHAIN_NAME.NEAR]: NearWeb3Public = null;

  constructor(
    private useTestingModeService: UseTestingModeService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpClient: HttpClient
  ) {
    this.setEthLikeWeb3();
    this.setSolanaWeb3();
    this.setNearWeb3();
    this.checkAllRpcProviders();

    this.initTestingMode();
  }

  private checkAllRpcProviders(timeout?: number): void {
    const web3List = WEB3_SUPPORTED_BLOCKCHAINS.map(key => this[key]).filter(i => i);

    const checkNode$ = (web3Public: EthLikeWeb3Public | SolanaWeb3Public) =>
      web3Public.healthCheck(timeout).pipe(
        tap(isNodeWorks => {
          if (isNodeWorks === null) {
            return;
          }

          if (web3Public instanceof SolanaWeb3Public) {
            if (!isNodeWorks) {
              this.setSolanaWeb3('additional');
              console.debug(`Broken Solana node has been replaced with a spare.`);
            }
          } else if (web3Public instanceof EthLikeWeb3Public) {
            const blockchainName = web3Public.blockchain.name as Web3SupportedBlockchains;
            const connector = this.connectionLinks.find(
              item => item.blockchainName === blockchainName
            );
            if (!isNodeWorks && connector?.additionalRpcLink) {
              this[blockchainName].setProvider(connector.additionalRpcLink);

              console.debug(
                `Broken ${web3Public.blockchain.name} node has been replaced with a spare.`
              );
            }
          }
        })
      );

    forkJoin([...web3List.map(checkNode$), checkNode$(this[BLOCKCHAIN_NAME.SOLANA])]).subscribe(
      () => this._nodesChecked$.next(true)
    );
  }

  private addWeb3(rpcLink: string, blockchainName: Web3SupportedBlockchains): void {
    const web3Public = new EthLikeWeb3Public(
      new Web3(rpcLink),
      BlockchainsInfo.getBlockchainByName(blockchainName),
      this.useTestingModeService,
      this.httpClient
    );

    const nodesChecked$ = this._nodesChecked$.asObservable();

    this[blockchainName] = new Proxy(web3Public, {
      get(target: EthLikeWeb3Public, prop: keyof EthLikeWeb3Public): unknown {
        if (prop === 'healthCheck' || prop === 'setProvider') {
          return target[prop].bind(target);
        }

        if (typeof target[prop] === 'function') {
          if (prop === 'isAddressCorrect' || prop === 'isNativeAddress') {
            return (...params: unknown[]) => (target[prop] as Function).call(target, ...params);
          }

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

  private setNearWeb3(): void {
    this[BLOCKCHAIN_NAME.NEAR] = new NearWeb3Public(NEAR_MAINNET_CONFIG, connection => {
      this.walletConnectorService.nearConnection = connection;
    });
  }

  private setSolanaWeb3(rpc: 'primary' | 'additional' = 'primary'): void {
    const blockchain = networks.find(el => el.name === BLOCKCHAIN_NAME.SOLANA);
    const url = rpc === 'primary' ? blockchain.rpcLink : blockchain.additionalRpcLink;
    const solanaConnection = new Connection(url);
    this.walletConnectorService.solanaWeb3Connection = solanaConnection;
    this[BLOCKCHAIN_NAME.SOLANA] = new SolanaWeb3Public(solanaConnection);
  }

  private setEthLikeWeb3(): void {
    this.connectionLinks = networks
      .filter(network => WEB3_SUPPORTED_BLOCKCHAINS.some(el => el === network.name))
      .map(network => ({
        blockchainName: network.name as Web3SupportedBlockchains,
        rpcLink: network.rpcLink,
        additionalRpcLink: network.additionalRpcLink
      }));
    this.connectionLinks.forEach(connection =>
      this.addWeb3(connection.rpcLink, connection.blockchainName)
    );
  }

  private initTestingMode(): void {
    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.connectionLinks.forEach(connection => {
          const testingConnection = this.connectionLinks.find(
            c => c.blockchainName === `${connection.blockchainName}_TESTNET`
          );
          if (!testingConnection) {
            return;
          }

          this[connection.blockchainName as Web3SupportedBlockchains] = new EthLikeWeb3Public(
            new Web3(testingConnection.rpcLink),
            BlockchainsInfo.getBlockchainByName(testingConnection.blockchainName),
            this.useTestingModeService,
            this.httpClient
          );

          this[`${connection.blockchainName}_TESTNET` as Web3SupportedBlockchains] =
            this[connection.blockchainName];
        });
      }
    });

    this.useTestingModeService.web3PublicSettings.rpcTimeout.subscribe(
      this.checkAllRpcProviders.bind(this)
    );
  }
}

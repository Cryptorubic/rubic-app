import { Injectable } from '@angular/core';
import Web3 from 'web3';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  ETH_LIKE_BLOCKCHAIN_NAMES,
  EthLikeBlockchainName
} from '@shared/models/blockchain/blockchain-name';
import { first, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import ConnectionLink from '@core/services/blockchain/models/connection-link';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import networks, { Network } from '@shared/constants/blockchain/networks';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { Connection } from '@solana/web3.js';
import { NearWeb3Public } from '@core/services/blockchain/blockchain-adapters/near/near-web3-public';
import { NEAR_MAINNET_CONFIG } from '@core/services/blockchain/blockchain-adapters/near/near-config';
import { isEthLikeBlockchainName } from '@shared/utils/blockchain/check-blockchain-name';
import IsNotEthLikeError from '@core/errors/models/common/is-not-eth-like-error';

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

  public [BLOCKCHAIN_NAME.SOLANA]: SolanaWeb3Public;

  public [BLOCKCHAIN_NAME.NEAR]: NearWeb3Public;

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpClient: HttpClient
  ) {
    this.setEthLikeWeb3();
    this.setSolanaWeb3();
    this.setNearWeb3();

    this.checkAllRpcProviders();
  }

  private setEthLikeWeb3(): void {
    this.connectionLinks = networks
      .filter(network => isEthLikeBlockchainName(network.name))
      .map((network: Network<EthLikeBlockchainName>) => ({
        blockchainName: network.name,
        rpcLink: network.rpcLink,
        additionalRpcLink: network.additionalRpcLink
      }));
    this.connectionLinks.forEach(connection =>
      this.addEthLikeWeb3(connection.rpcLink, connection.blockchainName)
    );
  }

  private addEthLikeWeb3(rpcLink: string, blockchainName: EthLikeBlockchainName): void {
    const web3Public = new EthLikeWeb3Public(
      new Web3(rpcLink),
      BlockchainsInfo.getBlockchainByName(blockchainName),
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

  private setSolanaWeb3(rpc: 'primary' | 'additional' = 'primary'): void {
    const blockchain = networks.find(network => network.name === BLOCKCHAIN_NAME.SOLANA);
    const url = rpc === 'primary' ? blockchain.rpcLink : blockchain.additionalRpcLink;
    const solanaConnection = new Connection(url);
    this.walletConnectorService.solanaWeb3Connection = solanaConnection;
    this[BLOCKCHAIN_NAME.SOLANA] = new SolanaWeb3Public(solanaConnection);
  }

  private setNearWeb3(): void {
    this[BLOCKCHAIN_NAME.NEAR] = new NearWeb3Public(NEAR_MAINNET_CONFIG, connection => {
      this.walletConnectorService.nearConnection = connection;
    });
  }

  private checkAllRpcProviders(timeout?: number): void {
    const checkNode$ = (web3Public: EthLikeWeb3Public | SolanaWeb3Public) =>
      web3Public.healthCheck(timeout).pipe(
        tap(isNodeWorks => {
          if (isNodeWorks) {
            return;
          }

          if (web3Public instanceof SolanaWeb3Public) {
            this.setSolanaWeb3('additional');
            console.debug(`Broken Solana node has been replaced with a spare.`);
            return;
          }

          const blockchainName = web3Public.blockchain.name;
          const connector = this.connectionLinks.find(
            item => item.blockchainName === blockchainName
          );
          if (connector?.additionalRpcLink) {
            this[blockchainName].setProvider(connector.additionalRpcLink);
            console.debug(
              `Broken ${web3Public.blockchain.name} node has been replaced with a spare.`
            );
          }
        })
      );

    forkJoin([
      ...ETH_LIKE_BLOCKCHAIN_NAMES.map(ethLikeBlockchainName =>
        checkNode$(this[ethLikeBlockchainName])
      ),
      checkNode$(this[BLOCKCHAIN_NAME.SOLANA])
    ]).subscribe(() => this._nodesChecked$.next(true));
  }

  public getEthLikeWeb3Public(blockchain: BlockchainName): EthLikeWeb3Public {
    if (!isEthLikeBlockchainName(blockchain)) {
      throw new IsNotEthLikeError(blockchain);
    }
    return this[blockchain];
  }
}

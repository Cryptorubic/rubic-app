import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { first, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import ConnectionLink from '@core/services/blockchain/models/ConnectionLink';
import { Web3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/web3-public';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { UseTestingModeService } from '@core/services/use-testing-mode/use-testing-mode.service';
import networks from '@shared/constants/blockchain/networks';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { Connection } from '@solana/web3.js';

export const WEB3_SUPPORTED_BLOCKCHAINS = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.AVALANCHE,
  BLOCKCHAIN_NAME.MOONRIVER,
  BLOCKCHAIN_NAME.FANTOM
] as const;

export type Web3SupportedBlockchains = typeof WEB3_SUPPORTED_BLOCKCHAINS[number];

@Injectable({
  providedIn: 'root'
})
export class PublicBlockchainAdapterService {
  private readonly _nodesChecked$ = new BehaviorSubject<boolean>(false);

  private readonly connectionLinks: ConnectionLink[];

  private readonly defaultConnectionLinks: ConnectionLink[];

  public [BLOCKCHAIN_NAME.ETHEREUM]: Web3Public;

  public [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: Web3Public;

  public [BLOCKCHAIN_NAME.POLYGON]: Web3Public;

  public [BLOCKCHAIN_NAME.HARMONY]: Web3Public;

  public [BLOCKCHAIN_NAME.AVALANCHE]: Web3Public;

  public [BLOCKCHAIN_NAME.MOONRIVER]: Web3Public;

  public [BLOCKCHAIN_NAME.FANTOM]: Web3Public;

  public readonly [BLOCKCHAIN_NAME.XDAI]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.POLYGON_TESTNET]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.HARMONY_TESTNET]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.SOLANA]: SolanaWeb3Public = null;

  constructor(
    private useTestingModeService: UseTestingModeService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpClient: HttpClient
  ) {
    this.defaultConnectionLinks = networks
      .filter(network => WEB3_SUPPORTED_BLOCKCHAINS.some(el => el === network.name))
      .map(network => ({
        blockchainName: network.name as Web3SupportedBlockchains,
        rpcLink: network.rpcLink,
        additionalRpcLink: network.additionalRpcLink
      }));
    this.connectionLinks = this.defaultConnectionLinks.filter(connection =>
      WEB3_SUPPORTED_BLOCKCHAINS.includes(connection.blockchainName)
    );
    this.connectionLinks.forEach(connection =>
      this.addWeb3(connection.rpcLink, connection.blockchainName)
    );

    // @TODO Solana. remove hardcode.
    const solanaRpc = {
      free: { url: 'https://free.rpcpool.com', weight: 10 },
      mainnet: { url: 'https://mainnet.rpcpool.com', weight: 10 },
      api: { url: 'https://api.rpcpool.com', weight: 10 },
      solanaApi: { url: 'https://solana-api.projectserum.com', weight: 10 },
      raydium: { url: 'https://raydium.rpcpool.com', weight: 50 },
      apiBeta: { url: 'https://api.mainnet-beta.solana.com', weight: 10 },
      devnet: { url: 'https://api.devnet.solana.com', weight: 0 }
    };
    const solanaConnection = new Connection(solanaRpc.solanaApi.url);
    this.walletConnectorService.solanaWeb3Connection = solanaConnection;
    this[BLOCKCHAIN_NAME.SOLANA] = new SolanaWeb3Public(solanaConnection);

    this.checkAllRpcProviders();

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.connectionLinks.forEach(connection => {
          const testingConnection = this.defaultConnectionLinks.find(
            c => c.blockchainName === `${connection.blockchainName}_TESTNET`
          );
          if (!testingConnection) {
            return;
          }

          this[connection.blockchainName as Web3SupportedBlockchains] = new Web3Public(
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

  private checkAllRpcProviders(timeout?: number): void {
    const web3List = WEB3_SUPPORTED_BLOCKCHAINS.map(key => this[key]).filter(i => i);

    const checkNode$ = (web3Public: Web3Public) =>
      web3Public.healthCheck(timeout).pipe(
        tap(isNodeWorks => {
          if (isNodeWorks === null) {
            return;
          }

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
        })
      );

    forkJoin(web3List.map(checkNode$)).subscribe(() => this._nodesChecked$.next(true));
  }

  private addWeb3(rpcLink: string, blockchainName: Web3SupportedBlockchains): void {
    const web3Public = new Web3Public(
      new Web3(rpcLink),
      BlockchainsInfo.getBlockchainByName(blockchainName),
      this.useTestingModeService,
      this.httpClient
    );

    const nodesChecked$ = this._nodesChecked$.asObservable();

    this[blockchainName] = new Proxy(web3Public, {
      get(target: Web3Public, prop: keyof Web3Public): unknown {
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
}

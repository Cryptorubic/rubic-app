import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { first, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import ConnectionLink from 'src/app/core/services/blockchain/models/ConnectionLink';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { PublicProviderService } from 'src/app/core/services/blockchain/providers/public-provider-service/public-provider.service';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';

export const WEB3_SUPPORTED_BLOCKCHAINS = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.AVALANCHE
] as const;

export type Web3SupportedBlockchains = typeof WEB3_SUPPORTED_BLOCKCHAINS[number];

@Injectable({
  providedIn: 'root'
})
export class Web3PublicService {
  private readonly _nodesChecked$ = new BehaviorSubject<boolean>(false);

  private readonly connectionLinks: ConnectionLink[];

  public [BLOCKCHAIN_NAME.ETHEREUM]: Web3Public;

  public [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: Web3Public;

  public [BLOCKCHAIN_NAME.POLYGON]: Web3Public;

  public [BLOCKCHAIN_NAME.HARMONY]: Web3Public;

  public [BLOCKCHAIN_NAME.AVALANCHE]: Web3Public;

  public readonly [BLOCKCHAIN_NAME.TRON]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.XDAI]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.POLYGON_TESTNET]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.HARMONY_TESTNET]: Web3Public = null;

  public readonly [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: Web3Public = null;

  constructor(
    publicProvider: PublicProviderService,
    private useTestingModeService: UseTestingModeService,
    private readonly httpClient: HttpClient
  ) {
    this.connectionLinks = publicProvider.connectionLinks.filter(connection =>
      WEB3_SUPPORTED_BLOCKCHAINS.includes(connection.blockchainName as Web3SupportedBlockchains)
    );
    this.connectionLinks.forEach(connection =>
      this.addWeb3(connection.rpcLink, connection.blockchainName as Web3SupportedBlockchains)
    );

    this.checkAllRpcProviders();

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.connectionLinks.forEach(connection => {
          const testingConnection = publicProvider.connectionLinks.find(
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

  private addWeb3(rpcLink: string, blockchainName: Web3SupportedBlockchains) {
    const web3Public = new Web3Public(
      new Web3(rpcLink),
      BlockchainsInfo.getBlockchainByName(blockchainName),
      this.useTestingModeService,
      this.httpClient
    );

    const nodesChecked$ = this._nodesChecked$.asObservable();

    this[blockchainName] = new Proxy(web3Public, {
      get(target: Web3Public, prop: keyof Web3Public) {
        if (prop === 'healthCheck' || prop === 'setProvider') {
          return target[prop].bind(target);
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

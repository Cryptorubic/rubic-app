import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin } from 'rxjs';
import ConnectionLink from '../types/ConnectionLink';
import { Web3Public } from './Web3Public';
import { PublicProviderService } from '../public-provider/public-provider.service';
import { BlockchainsInfo } from '../blockchain-info';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';

@Injectable({
  providedIn: 'root'
})
export class Web3PublicService {
  private readonly _nodesChecked$ = new BehaviorSubject<boolean>(false);

  private readonly connectionLinks: ConnectionLink[];

  constructor(
    publicProvider: PublicProviderService,
    private useTestingModeService: UseTestingModeService
  ) {
    this.connectionLinks = publicProvider.connectionLinks;
    const web3Connections = this.connectionLinks.reduce(
      (acc, connection) => ({
        ...acc,
        [connection.blockchainName as BLOCKCHAIN_NAME]: new Web3Public(
          new Web3(connection.rpcLink),
          BlockchainsInfo.getBlockchainByName(connection.blockchainName),
          this.useTestingModeService
        )
      }),
      {}
    );
    Object.assign(this, web3Connections);

    this.checkAllRpcProviders();

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.connectionLinks.forEach(connection => {
          if (!connection.blockchainName.includes('_TESTNET')) {
            const testingConnection = this.connectionLinks.find(
              c => c.blockchainName === `${connection.blockchainName}_TESTNET`
            );
            if (!testingConnection) {
              return;
            }

            this[connection.blockchainName] = new Web3Public(
              new Web3(testingConnection.rpcLink),
              BlockchainsInfo.getBlockchainByName(testingConnection.blockchainName),
              this.useTestingModeService
            );
          }
        });
      }
    });

    this.useTestingModeService.web3PublicSettings.rpcTimeout.subscribe(
      this.checkAllRpcProviders.bind(this)
    );
  }

  private checkAllRpcProviders(timeout?: number): void {
    const web3List = Object.values(BLOCKCHAIN_NAME)
      .map(key => this[key])
      .filter(i => i);

    const checkNode$ = (web3Public: Web3Public) =>
      web3Public.healthCheck(timeout).pipe(
        tap(isNodeWorks => {
          if (isNodeWorks === null) {
            return;
          }

          const blockchainName = web3Public.blockchain.name;
          const connector = this.connectionLinks.find(
            item => item.blockchainName === blockchainName
          );
          if (!isNodeWorks && connector?.additionalRpcLink) {
            this[web3Public.blockchain.name] = new Web3Public(
              new Web3(connector.additionalRpcLink),
              web3Public.blockchain,
              this.useTestingModeService
            );

            console.debug(
              `Broken ${web3Public.blockchain.label} node has been replaced with a spare.`
            );
          }
        })
      );

    forkJoin(web3List.map(checkNode$)).subscribe();
  }

  private addWeb3(rpcLink: string, blockchainName: BLOCKCHAIN_NAME) {
    const web3Public = new Web3Public(
      new Web3(rpcLink),
      BlockchainsInfo.getBlockchainByName(blockchainName),
      this.useTestingModeService
    );

    this[blockchainName] = new Proxy(web3Public, {
      // eslint-disable-next-line consistent-return
      get(target: Web3Public, prop) {
        if (prop === 'healthCheck') {
          return target[prop];
        }

        /*   if (typeof target === 'function') {
        } */
      }
    });
  }
}

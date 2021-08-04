import { Injectable } from '@angular/core';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import ConnectionLink from '../types/ConnectionLink';
import { Web3Public } from './Web3Public';
import { PublicProviderService } from '../public-provider/public-provider.service';
import { BlockchainsInfo } from '../blockchain-info';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';

@Injectable({
  providedIn: 'root'
})
export class Web3PublicService {
  private readonly connectionLinks: ConnectionLink[];

  static amountToWei(amount: BigNumber | string, decimals: number): string {
    return new BigNumber(amount || '0').times(new BigNumber(10).pow(decimals)).toFixed(0);
  }

  static weiToAmount(amountInWei: BigNumber | string | number, decimals: number): BigNumber {
    return new BigNumber(amountInWei).div(new BigNumber(10).pow(decimals));
  }

  public static addressToBytes32(address: string): string {
    if (address.slice(0, 2) !== '0x' || address.length !== 42) {
      console.error('Wrong address format');
      throw new UndefinedError();
    }

    return `0x${address.slice(2).padStart(64, '0')}`;
  }

  constructor(publicProvider: PublicProviderService, useTestingModeService: UseTestingModeService) {
    this.connectionLinks = publicProvider.connectionLinks;
    const web3Connections = this.connectionLinks.reduce(
      (acc, connection) => ({
        ...acc,
        [connection.blockchainName as BLOCKCHAIN_NAME]: new Web3Public(
          new Web3(connection.rpcLink),
          BlockchainsInfo.getBlockchainByName(connection.blockchainName),
          useTestingModeService
        )
      }),
      {}
    );
    Object.assign(this, web3Connections);

    useTestingModeService.isTestingMode.subscribe(isTestingMode => {
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
              useTestingModeService
            );
          }
        });
      }
    });
  }
}

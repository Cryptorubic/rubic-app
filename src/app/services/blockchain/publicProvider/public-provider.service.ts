import { Injectable } from '@angular/core';
import ConnectionLink from '../types/ConnectionLink';
import { BLOCKCHAIN_NAME } from '../types/Blockchain';

@Injectable({
  providedIn: 'root'
})
export class PublicProviderService {
  public readonly connectionLinks: ConnectionLink[];
  constructor() {
    this.connectionLinks = [
      {
        blockchainName: BLOCKCHAIN_NAME.ETHEREUM,
        rpcLink: 'https://mainnet.infura.io/v3/ecf1e6d0427b458b89760012a8500abf'
      },
      {
        blockchainName: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        rpcLink: 'https://bsc-dataseed1.binance.org'
      },
      {
        blockchainName: BLOCKCHAIN_NAME.MATIC,
        rpcLink: 'https://rpc-mainnet.matic.network'
      }
    ];
  }

  public getBlockchainRpcLink(blockchainName: BLOCKCHAIN_NAME) {
    return this.connectionLinks.find(connection => connection.blockchainName === blockchainName)
      ?.rpcLink;
  }
}

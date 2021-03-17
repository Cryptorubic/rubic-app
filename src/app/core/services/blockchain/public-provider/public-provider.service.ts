import { Injectable } from '@angular/core';
import ConnectionLink from '../types/ConnectionLink';

import networks from '../../../../shared/models/blockchain/networks';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

@Injectable({
  providedIn: 'root'
})
export class PublicProviderService {
  public readonly connectionLinks: ConnectionLink[];

  constructor() {
    this.connectionLinks = networks.map(network => ({
      blockchainName: network.name,
      rpcLink: network.rpcLink
    }));
  }

  public getBlockchainRpcLink(blockchainName: BLOCKCHAIN_NAME) {
    return this.connectionLinks.find(connection => connection.blockchainName === blockchainName)
      ?.rpcLink;
  }
}

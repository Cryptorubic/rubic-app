import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import ConnectionLink from 'src/app/core/services/blockchain/models/ConnectionLink';
import networks from 'src/app/shared/constants/blockchain/networks';

@Injectable({
  providedIn: 'root'
})
export class PublicProviderService {
  public readonly connectionLinks: ConnectionLink[];

  constructor() {
    this.connectionLinks = networks.map(network => ({
      blockchainName: network.name,
      rpcLink: network.rpcLink,
      additionalRpcLink: network.additionalRpcLink
    }));
  }

  public getBlockchainRpcLink(blockchainName: BLOCKCHAIN_NAME) {
    return this.connectionLinks.find(connection => connection.blockchainName === blockchainName)
      ?.rpcLink;
  }
}

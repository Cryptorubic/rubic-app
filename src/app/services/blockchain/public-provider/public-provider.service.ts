import { Injectable } from '@angular/core';
import ConnectionLink from '../types/ConnectionLink';
import { BLOCKCHAIN_NAME } from '../types/Blockchain';
import networks from '../constants/networks';

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

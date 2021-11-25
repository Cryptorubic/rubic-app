import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import ConnectionLink from 'src/app/core/services/blockchain/models/ConnectionLink';
import networks from 'src/app/shared/constants/blockchain/networks';
import {
  WEB3_SUPPORTED_BLOCKCHAINS,
  Web3SupportedBlockchains
} from 'src/app/core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';

@Injectable({
  providedIn: 'root'
})
export class PublicProviderService {
  public readonly connectionLinks: ConnectionLink[];

  constructor() {
    this.connectionLinks = networks
      .filter(network => WEB3_SUPPORTED_BLOCKCHAINS.some(el => el === network.name))
      .map(network => ({
        blockchainName: network.name as Web3SupportedBlockchains,
        rpcLink: network.rpcLink,
        additionalRpcLink: network.additionalRpcLink
      }));
  }

  public getBlockchainRpcLink(blockchainName: BLOCKCHAIN_NAME): string {
    return this.connectionLinks.find(connection => connection.blockchainName === blockchainName)
      ?.rpcLink;
  }
}

import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import networks, { Network } from '@shared/constants/blockchain/networks';
import { BlockchainName } from 'rubic-sdk';

export class BlockchainsInfo {
  static getBlockchainById(id: number | string): BlockchainData {
    return networks.find(network => network.id === Number(id)) as BlockchainData;
  }

  static getBlockchainByName<T extends string = BlockchainName>(name: T): BlockchainData<T> {
    return networks.find(network => network.name === name) as Network<T>;
  }

  static getBlockchainLabel(name: BlockchainName): string {
    return networks.find(network => network.name === name).label;
  }
}

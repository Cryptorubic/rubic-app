import networks from './constants/networks';
import { BLOCKCHAIN_NAME, IBlockchain } from '../../../shared/models/blockchain/IBlockchain';

export class BlockchainsInfo {
  static blockchainsList: IBlockchain[] = networks.map(network => ({
    id: network.id,
    name: network.name,
    nativeCoin: network.nativeCoin
  }));

  static getBlockchainById(id: Number | string): IBlockchain {
    return BlockchainsInfo.blockchainsList.find(network => network.id === Number(id));
  }

  static getBlockchainByName(name: BLOCKCHAIN_NAME): IBlockchain {
    return BlockchainsInfo.blockchainsList.find(network => network.name === name);
  }
}

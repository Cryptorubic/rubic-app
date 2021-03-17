import networks from '../../../shared/models/blockchain/networks';
import { IBlockchain } from '../../../shared/models/blockchain/IBlockchain';
import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export class BlockchainsInfo {
  static blockchainsList: IBlockchain[] = networks.map(network => ({
    id: network.id,
    name: network.name,
    imagePath: network.imagePath,
    nativeCoin: network.nativeCoin
  }));

  static getBlockchainById(id: Number | string): IBlockchain {
    return BlockchainsInfo.blockchainsList.find(network => network.id === Number(id));
  }

  static getBlockchainByName(name: BLOCKCHAIN_NAME): IBlockchain {
    return BlockchainsInfo.blockchainsList.find(network => network.name === name);
  }
}

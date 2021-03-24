import networks from '../../../shared/constants/blockchain/networks';
import { IBlockchain } from '../../../shared/models/blockchain/IBlockchain';
import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export class BlockchainsInfo {
  static getBlockchainById(id: Number | string): IBlockchain {
    return networks.find(network => network.id === Number(id)) as IBlockchain;
  }

  static getBlockchainByName(name: BLOCKCHAIN_NAME): IBlockchain {
    return networks.find(network => network.name === name) as IBlockchain;
  }
}

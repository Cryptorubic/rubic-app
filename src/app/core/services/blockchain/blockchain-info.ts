import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import networks from '../../../shared/constants/blockchain/networks';

export class BlockchainsInfo {
  static getBlockchainById(id: number | string): IBlockchain {
    return networks.find(network => network.id === Number(id)) as IBlockchain;
  }

  static getBlockchainByName(name: BLOCKCHAIN_NAME): IBlockchain {
    return networks.find(network => network.name === name) as IBlockchain;
  }
}

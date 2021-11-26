import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { WEB3_SUPPORTED_BLOCKCHAINS } from '@core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';
import networks from '../../../shared/constants/blockchain/networks';

export class BlockchainsInfo {
  static getBlockchainById(id: number | string): IBlockchain {
    return networks.find(network => network.id === Number(id)) as IBlockchain;
  }

  static getBlockchainByName(name: BLOCKCHAIN_NAME): IBlockchain {
    return networks.find(network => network.name === name) as IBlockchain;
  }

  static getBlockchainType(name: BLOCKCHAIN_NAME): 'solana' | 'ethLike' {
    if (WEB3_SUPPORTED_BLOCKCHAINS.some(el => el === name)) {
      return 'ethLike';
    }
    return 'solana';
  }
}

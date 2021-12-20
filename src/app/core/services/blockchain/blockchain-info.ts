import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { WEB3_SUPPORTED_BLOCKCHAINS } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import networks from '../../../shared/constants/blockchain/networks';
import CustomError from '@core/errors/models/custom-error';
import { BlockchainType } from '@shared/models/blockchain/blockchain-type';

export class BlockchainsInfo {
  static getBlockchainById(id: number | string): IBlockchain {
    return networks.find(network => network.id === Number(id)) as IBlockchain;
  }

  static getBlockchainByName(name: BLOCKCHAIN_NAME): IBlockchain {
    return networks.find(network => network.name === name) as IBlockchain;
  }

  static getBlockchainType(name: BLOCKCHAIN_NAME): BlockchainType {
    if (WEB3_SUPPORTED_BLOCKCHAINS.some(el => el === name)) {
      return 'ethLike';
    }
    if (name === BLOCKCHAIN_NAME.SOLANA) {
      return 'solana';
    }
    throw new CustomError('Unknown network');
  }

  static checkIsEthLike(name: BLOCKCHAIN_NAME): void | never {
    if (this.getBlockchainType(name) !== 'ethLike') {
      throw new CustomError('Wrong blockchain error');
    }
  }
}

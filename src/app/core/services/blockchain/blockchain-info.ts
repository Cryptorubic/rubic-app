import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { WEB3_SUPPORTED_BLOCKCHAINS } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import networks from '../../../shared/constants/blockchain/networks';
import CustomError from '@core/errors/models/custom-error';
import { BlockchainType } from '@shared/models/blockchain/blockchain-type';

export class BlockchainsInfo {
  static getBlockchainById(id: number | string): BlockchainData {
    return networks.find(network => network.id === Number(id)) as BlockchainData;
  }

  static getBlockchainByName(name: BLOCKCHAIN_NAME): BlockchainData {
    return networks.find(network => network.name === name) as BlockchainData;
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

  static getBlockchainLabel(name: BLOCKCHAIN_NAME): string {
    return networks.find(network => network.name === name).label;
  }

  static checkIsEthLike(name: BLOCKCHAIN_NAME): void | never {
    if (this.getBlockchainType(name) !== 'ethLike') {
      throw new CustomError('Wrong blockchain error');
    }
  }

  static checkIsSolana(name: BLOCKCHAIN_NAME): void | never {
    if (this.getBlockchainType(name) !== 'solana') {
      throw new CustomError('Wrong blockchain error');
    }
  }
}

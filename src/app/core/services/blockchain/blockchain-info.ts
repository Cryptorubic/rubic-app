import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  ETH_LIKE_BLOCKCHAIN_NAMES
} from '@shared/models/blockchain/blockchain-name';
import networks, { Network } from '@shared/constants/blockchain/networks';
import CustomError from '@core/errors/models/custom-error';
import { BlockchainType } from '@shared/models/blockchain/blockchain-type';

export class BlockchainsInfo {
  static getBlockchainById(id: number | string): BlockchainData {
    return networks.find(network => network.id === Number(id)) as BlockchainData;
  }

  static getBlockchainByName<T extends string = BlockchainName>(name: T): BlockchainData<T> {
    return networks.find(network => network.name === name) as Network<T>;
  }

  static getBlockchainType(name: BlockchainName): BlockchainType {
    if (ETH_LIKE_BLOCKCHAIN_NAMES.some(blockchainName => blockchainName === name)) {
      return 'ethLike';
    }
    if (name === BLOCKCHAIN_NAME.SOLANA) {
      return 'solana';
    }
    if (name === BLOCKCHAIN_NAME.NEAR) {
      return 'near';
    }
    throw new CustomError('Unknown network');
  }

  static getBlockchainLabel(name: BlockchainName): string {
    return networks.find(network => network.name === name).label;
  }
}

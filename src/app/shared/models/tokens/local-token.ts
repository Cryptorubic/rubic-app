import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface LocalToken {
  address: string;
  blockchain: BlockchainName;
}

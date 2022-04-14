import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface MinimalToken {
  address: string;
  blockchain: BlockchainName;
}

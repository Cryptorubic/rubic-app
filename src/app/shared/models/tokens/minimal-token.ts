import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export interface MinimalToken {
  address: string;
  blockchain: BLOCKCHAIN_NAME;
}

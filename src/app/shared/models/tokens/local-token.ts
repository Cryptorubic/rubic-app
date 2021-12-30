import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export interface LocalToken {
  address: string;
  blockchain: BLOCKCHAIN_NAME;
}

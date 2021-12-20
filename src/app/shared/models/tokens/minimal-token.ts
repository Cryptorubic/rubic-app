import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';

export interface MinimalToken {
  address: string;
  blockchain: BLOCKCHAIN_NAME;
}

import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface LocalToken {
  address: string;
  blockchain: BLOCKCHAIN_NAME;
}

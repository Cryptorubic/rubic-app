import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface CryptoTapToken {
  address: string;
  direction: BLOCKCHAIN_NAME;
}

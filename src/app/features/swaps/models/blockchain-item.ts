import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export interface BlockchainItem {
  symbol: BLOCKCHAIN_NAME;
  visibleName: string;
  image: string;
  id: number;
}

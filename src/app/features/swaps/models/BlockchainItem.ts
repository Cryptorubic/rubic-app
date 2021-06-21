import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface BlockchainItem {
  symbol: BLOCKCHAIN_NAME;
  visibleName: string;
  image: string;
  id: number;
}

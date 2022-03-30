import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface BlockchainItem {
  symbol: BlockchainName;
  visibleName: string;
  image: string;
  id: number;
}

import { BlockchainName } from 'rubic-sdk';

export interface BlockchainItem {
  symbol: BlockchainName;
  visibleName: string;
  image: string;
  id: number;
}

import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface Promotion {
  id: number;
  transactions: {
    hash: string;
    blockchain: BlockchainName;
    date: Date;
  }[];
  totalRefundUSD: number;
  refundDate: Date;
}

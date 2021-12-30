import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export interface Promotion {
  id: number;
  transactions: {
    hash: string;
    blockchain: BLOCKCHAIN_NAME;
    date: Date;
  }[];
  totalRefundUSD: number;
  refundDate: Date;
}

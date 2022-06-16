import { BlockchainName } from 'rubic-sdk';

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

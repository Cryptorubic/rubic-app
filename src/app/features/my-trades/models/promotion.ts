import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

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

import { FromBackendBlockchain } from '@shared/constants/blockchain/backend-blockchains';

export type RefundTransactionsResponse = {
  hash: string;
  network: FromBackendBlockchain;
  value: string;
  tokenAddress: string;
  date: number; // in seconds
}[];

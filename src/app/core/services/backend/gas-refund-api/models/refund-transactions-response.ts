import { FromBackendBlockchain } from '@shared/constants/blockchain/BACKEND_BLOCKCHAINS';

export type RefundTransactionsResponse = {
  hash: string;
  network: FromBackendBlockchain;
  value: string;
  tokenAddress: string;
  date: number; // in seconds
}[];

import { FromBackendBlockchains } from '@shared/constants/blockchain/BACKEND_BLOCKCHAINS';

export type RefundTransactionsResponse = {
  hash: string;
  network: FromBackendBlockchains;
  value: string;
  tokenAddress: string;
  date: number; // in seconds
}[];

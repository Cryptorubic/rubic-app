import { TransactionStatus } from '@shared/models/blockchain/transaction-status';

export interface CrossChainTokenApi {
  symbol: string;
  network: string;
  address: string;
  decimals: string;
  name: string;
  image: string;
}

export interface CrossChainTradesResponseApi {
  walletAddress: string;
  fromToken: CrossChainTokenApi;
  toToken: CrossChainTokenApi;
  fromAmount: string;
  toAmount: string;
  status: TransactionStatus;
  fromTransactionHash: string;
  toTransactionHash: string;
  fromTransactionScanURL: string;
  toTransactionScanURL: string;
  statusUpdatedAt: string;
}

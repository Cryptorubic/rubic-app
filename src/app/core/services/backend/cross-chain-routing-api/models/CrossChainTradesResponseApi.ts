import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';

interface CrossChainTokenApi {
  symbol: string;
  network: string;
  address: string;
}

export interface CrossChainTradesResponseApi {
  walletAddress: string;
  fromToken: CrossChainTokenApi;
  toToken: CrossChainTokenApi;
  fromAmount: string;
  toAmount: string;
  status: TRANSACTION_STATUS;
  fromTransactionHash: string;
  toTransactionHash: string;
  statusUpdatedAt: string;
}

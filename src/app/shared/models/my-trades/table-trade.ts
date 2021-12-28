import {
  BLOCKCHAIN_NAME,
  DEPRECATED_BLOCKCHAIN_NAME
} from '@shared/models/blockchain/blockchain-name';
import { InstantTradeProvider } from '@shared/models/instant-trade/instant-trade-provider';
import { BridgeProvider } from '@shared/models/bridge/bridge-provider';
import { TransactionStatus } from '@shared/models/blockchain/transaction-status';

export interface TableToken {
  blockchain: BLOCKCHAIN_NAME | DEPRECATED_BLOCKCHAIN_NAME;
  symbol: string;
  amount: string;
  image: string;
  address?: string;
}

export enum DEPRECATED_PROVIDER {
  PANAMA = 'panama',
  EVO = 'evodefi'
}

export type TableProvider =
  | InstantTradeProvider
  | BridgeProvider
  | DEPRECATED_PROVIDER
  | 'CROSS_CHAIN_ROUTING_PROVIDER'
  | 'GAS_REFUND_PROVIDER';

export interface TableTrade {
  transactionId?: string;
  fromTransactionHash: string;
  toTransactionHash?: string;
  transactionHashScanUrl?: string;
  status: TransactionStatus;
  provider: TableProvider;
  fromToken: TableToken;
  toToken: TableToken;
  date: Date;
}

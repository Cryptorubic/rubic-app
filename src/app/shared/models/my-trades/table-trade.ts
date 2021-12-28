import {
  BLOCKCHAIN_NAME,
  DEPRECATED_BLOCKCHAIN_NAME
} from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';

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
  | INSTANT_TRADE_PROVIDER
  | BRIDGE_PROVIDER
  | DEPRECATED_PROVIDER
  | 'CROSS_CHAIN_ROUTING_PROVIDER'
  | 'GAS_REFUND_PROVIDER';

export interface TableTrade {
  transactionId?: string;
  fromTransactionHash: string;
  toTransactionHash?: string;
  transactionHashScanUrl?: string;
  status: TRANSACTION_STATUS;
  provider: TableProvider;
  fromToken: TableToken;
  toToken: TableToken;
  date: Date;
}

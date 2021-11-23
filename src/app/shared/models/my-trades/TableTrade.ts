import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';

export interface TableToken {
  blockchain: BLOCKCHAIN_NAME;
  symbol: string;
  amount: string;
  image: string;
  address?: string;
}

export enum DEPRECATED_PROVIDER {
  PANAMA = 'panama'
}

export type TableProvider =
  | INSTANT_TRADES_PROVIDER
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

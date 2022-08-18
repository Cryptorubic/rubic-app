import { BlockchainName, CrossChainTradeType, TradeType } from 'rubic-sdk';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';
import { LiFiTradeSubtype } from 'rubic-sdk/lib/features/cross-chain/providers/lifi-trade-provider/models/lifi-providers';
import { RangoTradeSubtype } from 'rubic-sdk/lib/features/cross-chain/providers/rango-trade-provider/models/rango-providers';

export interface TableToken {
  blockchain: BlockchainName;
  symbol: string;
  amount: string;
  image: string;
  address?: string;
}

export type TableProvider =
  | TradeType
  | BRIDGE_PROVIDER
  | LiFiTradeSubtype
  | CrossChainTradeType
  | RangoTradeSubtype
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

export interface TableData {
  totalCount: number;
  trades: TableTrade[];
}

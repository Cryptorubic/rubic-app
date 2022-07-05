import { RecentTradeStatus } from '@app/core/recent-trades/models/recent-trade-status.enum';
import { Token } from '../tokens/token';
import { BlockchainName, CrossChainTradeType } from 'rubic-sdk';

export interface RecentTrade {
  srcTxHash: string;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  fromToken: Token;
  toToken: Token;
  crossChainProviderType: CrossChainTradeType;
  timestamp: number;
  calculatedStatusTo?: RecentTradeStatus;
  calculatedStatusFrom?: RecentTradeStatus;
}

import { Blockchain } from '@app/shared/constants/blockchain/ui-blockchains';
import { RecentTradeStatus } from './recent-trade-status.enum';
import { Token } from '@app/shared/models/tokens/token';
import { CrossChainTradeType } from 'rubic-sdk';

export interface UiRecentTrade {
  fromBlockchain: Blockchain;
  toBlockchain: Blockchain;
  fromToken: Token;
  toToken: Token;
  timestamp: number;
  srcTxLink: string;
  srcTxHash: string;
  statusFrom?: RecentTradeStatus;
  statusTo?: RecentTradeStatus;
  crossChainProviderType: CrossChainTradeType;
}

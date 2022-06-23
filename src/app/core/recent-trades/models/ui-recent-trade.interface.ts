import { Blockchain } from '@app/features/my-trades/constants/blockchains';
import { CROSS_CHAIN_PROVIDER } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { RecentTradeStatus } from './recent-trade-status.enum';
import { Token } from '@app/shared/models/tokens/token';

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
  crossChainProviderType: CROSS_CHAIN_PROVIDER;
}

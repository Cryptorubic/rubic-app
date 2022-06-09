import { Blockchain } from '@app/features/my-trades/constants/blockchains';
import { CROSS_CHAIN_PROVIDER } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { BlockchainName } from '../blockchain/blockchain-name';
import { Token } from '../tokens/token';
import { RecentTradeStatus } from './recent-trade-status.enum';

export interface RecentTrade {
  srcTxHash: string;
  dstTxHash?: string;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  fromToken: Token;
  toToken: Token;
  crossChainProviderType: CROSS_CHAIN_PROVIDER;
  timestamp: number;
  _parsed?: boolean;
}

export interface UiRecentTrade {
  fromBlockchain: Blockchain;
  toBlockchain: Blockchain;
  fromToken: Token;
  toToken: Token;
  timestamp: number;
  srcTxLink: string;
  statusFrom: RecentTradeStatus;
  statusTo: RecentTradeStatus;
}

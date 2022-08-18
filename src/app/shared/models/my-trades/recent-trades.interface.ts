import { Token } from '../tokens/token';
import { BlockchainName, CrossChainTradeType, CrossChainTxStatus } from 'rubic-sdk';

export interface RecentTrade {
  srcTxHash: string;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  fromToken: Token;
  toToken: Token;
  crossChainProviderType: CrossChainTradeType;
  timestamp: number;
  calculatedStatusTo?: CrossChainTxStatus;
  calculatedStatusFrom?: CrossChainTxStatus;
  bridgeType?: string;
  requestId?: string;
}

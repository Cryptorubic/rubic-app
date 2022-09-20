import { Token } from '../tokens/token';
import { BlockchainName, CrossChainTradeType, CrossChainTxStatus } from 'rubic-sdk';

export interface RecentTrade {
  srcTxHash: string;
  dstTxHash?: string;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  fromToken: Token;
  toToken: Token;
  crossChainProviderType: CrossChainTradeType;
  timestamp: number;
  calculatedStatusTo?: CrossChainTxStatus;
  calculatedStatusFrom?: CrossChainTxStatus;
  bridgeType?: string;
  viaUuid?: string;
  rangoRequestId?: string;
}

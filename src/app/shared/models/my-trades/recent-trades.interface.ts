import { BridgeType, CrossChainTradeType, TxStatus } from 'rubic-sdk';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';

export interface RecentTrade {
  srcTxHash: string;
  dstTxHash?: string;

  fromToken: BlockchainToken;
  toToken: BlockchainToken;

  crossChainTradeType: CrossChainTradeType;
  bridgeType?: BridgeType;

  timestamp: number;

  calculatedStatusTo?: TxStatus;
  calculatedStatusFrom?: TxStatus;

  viaUuid?: string;
  rangoRequestId?: string;
  amountOutMin?: string;
}

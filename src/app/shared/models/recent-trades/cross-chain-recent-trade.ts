import { BridgeType, CrossChainTradeType, TxStatus } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';

export interface CrossChainRecentTrade {
  srcTxHash: string;
  dstTxHash?: string;

  fromToken: TokenAmount;
  toToken: TokenAmount;

  crossChainTradeType: CrossChainTradeType;
  bridgeType?: BridgeType;

  timestamp: number;

  calculatedStatusTo?: TxStatus;
  calculatedStatusFrom?: TxStatus;

  viaUuid?: string;
  rangoRequestId?: string;
  amountOutMin?: string;
}

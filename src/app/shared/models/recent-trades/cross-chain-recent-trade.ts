import { BridgeType, CrossChainTradeType } from 'rubic-sdk';
import { CommonRecentTrade } from '@shared/models/recent-trades/common-recent-trade';
import { Token } from '@shared/models/tokens/token';

export interface CrossChainRecentTrade extends CommonRecentTrade {
  fromToken: Token;

  crossChainTradeType: CrossChainTradeType;
  /**
   * @deprecated
   */
  crossChainProviderType?: string;
  bridgeType?: BridgeType;

  viaUuid?: string;
  rangoRequestId?: string;
  amountOutMin?: string;
  changenowId?: string;

  fromAmount: string;
  toAmount: string;
}

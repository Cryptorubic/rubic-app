import { BridgeType, CrossChainTradeType } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { CommonRecentTrade } from '@shared/models/recent-trades/common-recent-trade';

export interface CrossChainRecentTrade extends CommonRecentTrade {
  fromToken: TokenAmount;

  crossChainTradeType: CrossChainTradeType;
  /**
   * @deprecated
   */
  crossChainProviderType?: string;
  bridgeType?: BridgeType;

  viaUuid?: string;
  rangoRequestId?: string;
  amountOutMin?: string;
}

import { BridgeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { CrossChainTradeType } from '@cryptorubic/core';
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
  squidrouterRequestId?: string;

  fromAmount: string;
  toAmount: string;
}

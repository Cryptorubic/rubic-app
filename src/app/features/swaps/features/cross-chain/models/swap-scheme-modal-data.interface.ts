import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { CrossChainTradeType } from 'rubic-sdk';
import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';
import { ShortTonPromoInfo } from '@features/swaps/features/cross-chain/services/ton-promo-service/models/ton-promo';

export interface SwapSchemeModalData {
  srcProvider: ProviderInfo;
  dstProvider: ProviderInfo;
  fromToken: TokenAmount;
  toToken: TokenAmount;
  crossChainProvider: CrossChainTradeType;
  srcTxHash: string;
  timestamp: number;
  bridgeType?: ProviderInfo;
  viaUuid?: string;
  rangoRequestId?: string;
  amountOutMin?: string;
  changenowId?: string;
  isSwapAndEarnData?: boolean;
  tonPromoTrade?: ShortTonPromoInfo;
  points?: number;
}

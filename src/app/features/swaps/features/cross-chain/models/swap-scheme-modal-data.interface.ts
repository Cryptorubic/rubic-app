import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { BlockchainName, CrossChainTradeType } from 'rubic-sdk';
import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';

export interface SwapSchemeModalData {
  srcProvider: ProviderInfo;
  dstProvider: ProviderInfo;
  fromToken: TokenAmount;
  toToken: TokenAmount;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  crossChainProvider: CrossChainTradeType;
  srcTxHash: string;
  timestamp: number;
  bridgeType?: ProviderInfo;
  viaUuid?: string;
  rangoRequestId?: string;
  amountOutMin?: string;
}

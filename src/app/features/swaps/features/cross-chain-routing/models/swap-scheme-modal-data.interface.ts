import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { BlockchainName, CrossChainTradeType, TradeType } from 'rubic-sdk';

export interface SwapSchemeModalData {
  srcProvider: TradeType;
  dstProvider: TradeType;
  fromToken: TokenAmount;
  toToken: TokenAmount;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  crossChainProvider: CrossChainTradeType;
  srcTxHash: string;
  bridgeType?: string;
}

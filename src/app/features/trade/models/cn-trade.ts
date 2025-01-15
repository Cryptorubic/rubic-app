import { Token } from '@shared/models/tokens/token';
import { CrossChainTradeType, OnChainTradeType } from 'rubic-sdk';

export interface CrossChainTransferTrade {
  id: string;

  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;

  depositAddress: string;
  receiverAddress: string;

  timestamp: number;
  tradeType: CrossChainTradeType | OnChainTradeType;

  extraField?: {
    name?: string;
    value?: string;
  };
}

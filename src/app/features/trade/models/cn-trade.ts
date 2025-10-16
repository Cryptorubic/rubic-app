import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { CrossChainTradeType, OnChainTradeType } from '@cryptorubic/sdk';

export interface CrossChainTransferTrade {
  id: string;

  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: BigNumber;

  depositAddress: string;
  receiverAddress: string;

  timestamp: number;
  tradeType: CrossChainTradeType | OnChainTradeType;

  extraField?: {
    name?: string;
    value?: string;
  };
}

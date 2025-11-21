import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { OnChainTradeType } from '@cryptorubic/core';
import { CrossChainTradeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/models/cross-chain-trade-type';

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

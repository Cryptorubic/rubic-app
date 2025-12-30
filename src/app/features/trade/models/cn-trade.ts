import { TransferTradeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/constans/transfer-trade-supported-providers';
import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';

export interface CrossChainTransferTrade {
  rubicId: string;
  id: string;

  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: BigNumber;

  depositAddress: string;
  receiverAddress: string;

  timestamp: number;
  tradeType: TransferTradeType;

  extraField?: {
    name?: string;
    value?: string;
  };
}

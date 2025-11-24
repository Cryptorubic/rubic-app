import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { TransferTradeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/utils/get-deposit-status';

export interface CrossChainTransferTrade {
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

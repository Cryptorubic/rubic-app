import { CrossChainTransferTradeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/constans/transfer-trade-supported-providers';
import { OnChainTransferTradeType } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-transfer-trade/constants/on-chain-transfer-trade-supported-providers';
import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';

export type DepositTradeType = CrossChainTransferTradeType | OnChainTransferTradeType;

export interface DepositTrade {
  rubicId: string;
  id: string;

  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: BigNumber;

  depositAddress: string;
  receiverAddress: string;

  timestamp: number;
  tradeType: DepositTradeType;

  extraField?: {
    name?: string;
    value?: string;
  };
}

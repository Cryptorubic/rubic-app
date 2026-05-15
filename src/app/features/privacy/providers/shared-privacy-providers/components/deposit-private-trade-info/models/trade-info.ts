import { CrossChainTransferTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/cross-chain-transfer-trade';

export interface TradeInfo {
  id: string;
  trade: CrossChainTransferTrade;
  extraField?: {
    name: string;
    value: string;
    text: string;
  };
}

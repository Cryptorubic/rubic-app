import { CrossChainReactivelyCalculatedTradeData } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/models/cross-chain-reactively-calculated-trade-data';
import { OnChainReactivelyCalculatedTradeData } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/models/on-chain-reactively-calculated-trade-data';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';

export interface TradeContainer {
  value: CrossChainReactivelyCalculatedTradeData | OnChainReactivelyCalculatedTradeData;
  type: SWAP_PROVIDER_TYPE;
}

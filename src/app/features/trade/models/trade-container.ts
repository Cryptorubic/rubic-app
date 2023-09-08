import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import {
  CrossChainReactivelyCalculatedTradeData,
  OnChainReactivelyCalculatedTradeData
} from 'rubic-sdk';

export interface TradeContainer {
  value: CrossChainReactivelyCalculatedTradeData | OnChainReactivelyCalculatedTradeData;
  type: SWAP_PROVIDER_TYPE;
}

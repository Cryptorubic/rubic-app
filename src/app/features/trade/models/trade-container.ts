import {
  CrossChainReactivelyCalculatedTradeData,
  OnChainReactivelyCalculatedTradeData
} from 'rubic-sdk';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';

export interface TradeContainer {
  value: CrossChainReactivelyCalculatedTradeData | OnChainReactivelyCalculatedTradeData;
  type: SWAP_PROVIDER_TYPE;
}

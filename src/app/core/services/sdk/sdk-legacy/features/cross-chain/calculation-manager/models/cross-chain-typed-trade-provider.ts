import { CrossChainTradeType } from './cross-chain-trade-type';
import { CrossChainProvider } from '../providers/common/cross-chain-provider';

export type CrossChainTypedTradeProviders = Readonly<
  Record<CrossChainTradeType, CrossChainProvider>
>;

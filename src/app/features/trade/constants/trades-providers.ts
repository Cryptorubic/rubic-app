import { TradeProvider } from '@features/trade/models/trade-provider';
import { ProviderInfo } from '@features/trade/models/provider-info';
import { ON_CHAIN_PROVIDERS } from '@features/trade/constants/on-chain-providers';
import { BRIDGE_PROVIDERS } from '@features/trade/constants/bridge-providers';

export const TRADES_PROVIDERS: Record<TradeProvider, ProviderInfo> = {
  ...ON_CHAIN_PROVIDERS,
  ...BRIDGE_PROVIDERS
};

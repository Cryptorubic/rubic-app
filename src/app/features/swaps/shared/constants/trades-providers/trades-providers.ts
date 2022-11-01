import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';
import { RUBIC_BRIDGE_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/rubic-bridge-providers';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import { ON_CHAIN_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/on-chain-providers';
import { BRIDGE_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/bridge-providers';

export const TRADES_PROVIDERS: Record<TradeProvider, ProviderInfo> = {
  ...RUBIC_BRIDGE_PROVIDERS,
  ...ON_CHAIN_PROVIDERS,
  ...BRIDGE_PROVIDERS
};

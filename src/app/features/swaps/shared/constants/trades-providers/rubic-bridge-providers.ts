import { RUBIC_BRIDGE_PROVIDER } from '@features/swaps/shared/models/trade-provider/bridge-provider';
import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';

const imageBasePath = 'assets/images/icons/providers/rubic-bridge/';

export const RUBIC_BRIDGE_PROVIDERS: Record<RUBIC_BRIDGE_PROVIDER, ProviderInfo> = {
  [RUBIC_BRIDGE_PROVIDER.SWAP_RBC]: {
    name: 'Rubic',
    image: `${imageBasePath}rubic.svg`
  }
};

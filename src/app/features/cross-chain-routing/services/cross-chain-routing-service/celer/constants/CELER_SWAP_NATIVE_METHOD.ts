import { ProviderType } from '../models/provider-type.enum';

export const CELER_SWAP_NATIVE_METHOD = {
  [ProviderType.INCH]: 'transferWithSwapInchNative',
  [ProviderType.V2]: 'transferWithSwapV2Native',
  [ProviderType.V3]: 'transferWithSwapV3Native',
  [ProviderType.BRIDGE]: 'bridgeWithSwapNative'
};

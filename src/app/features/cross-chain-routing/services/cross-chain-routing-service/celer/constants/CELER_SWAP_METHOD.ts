import { ProviderType } from '../models/provider-type.enum';

export const CELER_SWAP_METHOD = {
  [ProviderType.INCH]: 'transferWithSwapInch',
  [ProviderType.V2]: 'transferWithSwapV2',
  [ProviderType.V3]: 'transferWithSwapV3'
};

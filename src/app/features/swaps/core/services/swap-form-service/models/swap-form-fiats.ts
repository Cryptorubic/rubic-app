import { SwapFormInput } from '@features/swaps/core/services/swap-form-service/models/swap-form-controls';
import { FiatAsset } from '@features/swaps/shared/models/fiats/fiat-asset';

export interface SwapFormInputFiats extends SwapFormInput {
  fromAssetType: 'fiat' | null;
  fromAsset: FiatAsset | null;
}

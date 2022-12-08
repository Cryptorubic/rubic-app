import { SwapFormInput } from '@features/swaps/core/services/swap-form-service/models/swap-form-controls';
import { FiatAsset } from '@features/swaps/core/services/fiats-selector-service/models/fiat-asset';

export interface SwapFormInputFiats extends SwapFormInput {
  fromAssetType: 'fiat' | null;
  fromAsset: FiatAsset | null;
}

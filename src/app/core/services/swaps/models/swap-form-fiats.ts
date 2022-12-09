import { SwapFormInput } from '@core/services/swaps/models/swap-form-controls';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';

export interface SwapFormInputFiats extends SwapFormInput {
  fromAssetType: 'fiat' | null;
  fromFiat: FiatAsset | null;
}

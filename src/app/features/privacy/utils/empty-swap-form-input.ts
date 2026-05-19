import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';

export function getEmptySwapFormInput(): SwapFormInput {
  return {
    fromAmount: null,
    fromBlockchain: null,
    fromToken: null,
    toBlockchain: null,
    toToken: null
  };
}

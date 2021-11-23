import { ISwapMethods } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/SWAP_METHOD';

export const AVAX_SWAP_METHOD: ISwapMethods = {
  TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
  ETH_TO_TOKENS: 'swapExactAVAXForTokens',
  TOKENS_TO_ETH: 'swapExactTokensForAVAX',
  TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
  ETH_TO_TOKENS_SUPPORTING_FEE: 'swapExactAVAXForTokensSupportingFeeOnTransferTokens',
  TOKENS_TO_ETH_SUPPORTING_FEE: 'swapExactTokensForAVAXSupportingFeeOnTransferTokens'
};

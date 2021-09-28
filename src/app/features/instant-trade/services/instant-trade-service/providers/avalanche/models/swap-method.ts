export enum AVAX_SWAP_METHOD {
  TOKENS_TO_TOKENS = 'swapExactTokensForTokens',
  ETH_TO_TOKENS = 'swapExactAVAXForTokens',
  TOKENS_TO_ETH = 'swapExactTokensForAVAX',
  TOKENS_TO_TOKENS_SUPPORTING_FEE = 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
  ETH_TO_TOKENS_SUPPORTING_FEE = 'swapExactAVAXForTokensSupportingFeeOnTransferTokens',
  TOKENS_TO_ETH_SUPPORTING_FEE = 'swapExactTokensForAVAXSupportingFeeOnTransferTokens'
}

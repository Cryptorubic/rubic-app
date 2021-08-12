export enum SWAP_METHOD {
  TOKENS_TO_TOKENS = 'swapExactTokensForTokens',
  ETH_TO_TOKENS = 'swapExactETHForTokens',
  TOKENS_TO_ETH = 'swapExactTokensForETH',
  TOKENS_TO_TOKENS_SUPPORTING_FEE = 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
  ETH_TO_TOKENS_SUPPORTING_FEE = 'swapExactETHForTokensSupportingFeeOnTransferTokens',
  TOKENS_TO_ETH_SUPPORTING_FEE = 'swapExactTokensForETHSupportingFeeOnTransferTokens'
}

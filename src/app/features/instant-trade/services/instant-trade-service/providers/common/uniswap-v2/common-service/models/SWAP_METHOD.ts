export enum DEFAULT_SWAP_METHODS {
  TOKENS_TO_TOKENS = 'swapExactTokensForTokens',
  ETH_TO_TOKENS = 'swapExactETHForTokens',
  TOKENS_TO_ETH = 'swapExactTokensForETH',
  TOKENS_TO_TOKENS_SUPPORTING_FEE = 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
  ETH_TO_TOKENS_SUPPORTING_FEE = 'swapExactETHForTokensSupportingFeeOnTransferTokens',
  TOKENS_TO_ETH_SUPPORTING_FEE = 'swapExactTokensForETHSupportingFeeOnTransferTokens'
}

export interface ISwapMethods {
  TOKENS_TO_TOKENS: string;
  ETH_TO_TOKENS: string;
  TOKENS_TO_ETH: string;
  TOKENS_TO_TOKENS_SUPPORTING_FEE: string;
  ETH_TO_TOKENS_SUPPORTING_FEE: string;
  TOKENS_TO_ETH_SUPPORTING_FEE: string;
}

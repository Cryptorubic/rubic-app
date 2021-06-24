import BigNumber from 'bignumber.js';

interface UniSwapTrade {
  amountIn: string;
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: number;
}

interface UniswapRoute {
  path: string[];
  outputAbsoluteAmount: BigNumber;
}

interface Gas {
  estimatedGas;
  gasFeeInUsd;
  gasFeeInEth;
}

enum SWAP_METHOD {
  TOKENS_TO_TOKENS = 'swapExactTokensForTokens',
  ETH_TO_TOKENS = 'swapExactETHForTokens',
  TOKENS_TO_ETH = 'swapExactTokensForETH'
}

export { UniswapRoute, SWAP_METHOD, Gas, UniSwapTrade };

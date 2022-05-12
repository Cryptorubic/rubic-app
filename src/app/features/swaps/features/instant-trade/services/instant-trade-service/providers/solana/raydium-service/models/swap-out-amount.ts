import BigNumber from 'bignumber.js';

export interface SwapOutAmount {
  amountIn: BigNumber;
  amountOut: BigNumber;
  amountOutWithSlippage: BigNumber;
  priceImpact: number;
}

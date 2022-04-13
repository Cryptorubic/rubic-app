export interface UniswapV2Trade {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: number;
}

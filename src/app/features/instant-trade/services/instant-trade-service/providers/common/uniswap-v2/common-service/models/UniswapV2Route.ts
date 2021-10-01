import BigNumber from 'bignumber.js';

export interface UniswapV2Route {
  path: string[];
  outputAbsoluteAmount: BigNumber;
}

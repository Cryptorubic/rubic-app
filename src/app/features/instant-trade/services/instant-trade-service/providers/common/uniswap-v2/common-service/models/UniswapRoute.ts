import BigNumber from 'bignumber.js';

export interface UniswapRoute {
  path: string[];
  outputAbsoluteAmount: BigNumber;
}

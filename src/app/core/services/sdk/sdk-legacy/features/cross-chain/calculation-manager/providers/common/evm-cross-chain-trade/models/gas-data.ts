import BigNumber from 'bignumber.js';

export type GasData = {
  /* wei */
  readonly totalGas?: BigNumber;
  /* wei */
  readonly gasLimit?: BigNumber;
  /* wei */
  readonly gasPrice?: BigNumber;
  /* non wei */
  readonly baseFee?: BigNumber;
  /* non wei */
  readonly maxFeePerGas?: BigNumber;
  /* non wei */
  readonly maxPriorityFeePerGas?: BigNumber;
} | null;

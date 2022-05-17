import BigNumber from 'bignumber.js';

export const wethToEthEstimatedGas = new BigNumber(36_000);

export const swapEstimatedGas = [
  new BigNumber(110_000),
  new BigNumber(210_000),
  new BigNumber(310_000)
];

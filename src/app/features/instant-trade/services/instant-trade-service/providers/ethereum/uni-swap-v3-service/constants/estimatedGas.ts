import BigNumber from 'bignumber.js';

export const ETHtoWETHEstimatedGas = new BigNumber(28_000);

export const WETHtoETHEstimatedGas = new BigNumber(36_000);

export const swapEstimatedGas = [
  new BigNumber(110_000),
  new BigNumber(210_000),
  new BigNumber(310_000)
];

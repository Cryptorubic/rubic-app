import BigNumber from 'bignumber.js';

export interface CrossChainTradeInfo {
  feePercent: number;
  feeAmount: BigNumber;
  feeTokenSymbol: string;

  cryptoFee: number;
  estimatedGas: BigNumber; // in Eth units

  priceImpactFrom: number;
  priceImpactTo: number;

  fromPath: string[] | null; // null if `tokenIn` = `transitToken`
  toPath: string[] | null; // null if `tokenOut` = `transitToken`
}

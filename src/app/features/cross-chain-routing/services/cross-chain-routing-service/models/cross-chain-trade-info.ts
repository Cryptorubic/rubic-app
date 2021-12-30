import BigNumber from 'bignumber.js';

export interface CrossChainTradeInfo {
  feePercent: number;
  feeAmount: BigNumber;
  feeTokenSymbol: string;
  cryptoFee: number;
  estimatedGas: BigNumber; // in Eth units
  priceImpactFrom: number;
  priceImpactTo: number;
}

import BigNumber from 'bignumber.js';
import { OnChainTradeType } from 'rubic-sdk';

export interface CelerRubicTradeInfo {
  feePercent: number;
  feeAmount: BigNumber;
  feeTokenSymbol: string;

  cryptoFee: number;
  estimatedGas: BigNumber; // in Eth units

  priceImpactFrom: number;
  priceImpactTo: number;

  fromProvider: OnChainTradeType;
  toProvider: OnChainTradeType;

  fromPath: string[] | null; // null if `tokenIn` = `transitToken`
  toPath: string[] | null; // null if `tokenOut` = `transitToken`

  usingCelerBridge: boolean; // true if bridging pair of tokens through Celer bridge
}

export interface SymbiosisTradeInfo {
  estimatedGas: BigNumber; // in Eth units

  feePercent: number;
  feeTokenSymbol: string;
  feeAmount: BigNumber;

  networkFee: BigNumber;
  networkFeeSymbol: string;

  priceImpact: string;
}

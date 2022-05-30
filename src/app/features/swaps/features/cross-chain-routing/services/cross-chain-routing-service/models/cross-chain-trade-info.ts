import BigNumber from 'bignumber.js';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';

export interface CelerRubicTradeInfo {
  feePercent: number;
  feeAmount: BigNumber;
  feeTokenSymbol: string;

  cryptoFee: number;
  estimatedGas: BigNumber; // in Eth units

  priceImpactFrom: number;
  priceImpactTo: number;

  fromProvider: INSTANT_TRADE_PROVIDER;
  toProvider: INSTANT_TRADE_PROVIDER;

  fromPath: string[] | null; // null if `tokenIn` = `transitToken`
  toPath: string[] | null; // null if `tokenOut` = `transitToken`

  usingCelerBridge: boolean; // true if bridging pair of tokens through Celer bridge
}

export interface SymbiosisTradeInfo {
  estimatedGas: BigNumber; // in Eth units
}

import BigNumber from 'bignumber.js';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

export interface CrossChainTradeInfo {
  feePercent: number;
  feeAmount: BigNumber;
  feeTokenSymbol: string;

  cryptoFee: number;
  estimatedGas: BigNumber; // in Eth units

  priceImpactFrom: number;
  priceImpactTo: number;

  fromProvider: INSTANT_TRADES_PROVIDER;
  toProvider: INSTANT_TRADES_PROVIDER;

  fromPath: string[] | null; // null if `tokenIn` = `transitToken`
  toPath: string[] | null; // null if `tokenOut` = `transitToken`
}

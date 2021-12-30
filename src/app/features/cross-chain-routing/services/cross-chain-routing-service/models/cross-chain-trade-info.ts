import BigNumber from 'bignumber.js';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';

export interface CrossChainTradeInfo {
  feePercent: number;
  feeAmount: BigNumber;
  feeTokenSymbol: string;

  cryptoFee: number;
  estimatedGas: BigNumber; // in Eth units

  priceImpactFrom: number;
  priceImpactTo: number;

  fromProvider: INSTANT_TRADES_PROVIDERS;
  toProvider: INSTANT_TRADES_PROVIDERS;

  fromPath: string[] | null; // null if `tokenIn` = `transitToken`
  toPath: string[] | null; // null if `tokenOut` = `transitToken`
}

import BigNumber from 'bignumber.js';
import { BalanceToken } from './balance-token';

export interface GasToken extends BalanceToken {
  gasFee: BigNumber;
  gasFeeUsd: BigNumber;
}

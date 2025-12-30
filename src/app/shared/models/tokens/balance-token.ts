import BigNumber from 'bignumber.js';
import { Token } from '@shared/models/tokens/token';

export interface BalanceToken extends Token {
  /**
   * Balance of token in wallet.
   * Equals `BigNumber(NaN)` in case balance was not calculated.
   */
  amount: BigNumber;

  favorite: boolean;
}

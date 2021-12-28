import BigNumber from 'bignumber.js';
import { Tokens } from '@shared/models/tokens/tokens';

export interface TokenAmount extends Tokens {
  /**
   * Balance of token in wallet.
   * Equals `BigNumber(NaN)` in case balance was not calculated.
   */
  amount: BigNumber;

  favorite: boolean;
}

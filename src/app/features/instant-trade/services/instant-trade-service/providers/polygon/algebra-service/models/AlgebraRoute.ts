import BigNumber from 'bignumber.js';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';

export interface AlgebraRoute {
  /**
   * Resulting value in Wei.
   */
  outputAbsoluteAmount: BigNumber;

  /**
   * List of pools' contract addresses to use in a trade's route.
   */
  path: SymbolToken[];
}

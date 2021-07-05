import BigNumber from 'bignumber.js';
import { IToken } from './IToken';

export interface TokenAmount extends IToken {
  amount: BigNumber;
}

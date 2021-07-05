import BigNumber from 'bignumber.js';
import { Token } from 'src/app/shared/models/tokens/Token';

export interface TokenAmount extends Token {
  amount: BigNumber;
}

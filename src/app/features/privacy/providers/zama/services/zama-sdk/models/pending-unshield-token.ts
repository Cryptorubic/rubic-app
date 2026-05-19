import { Token } from '@app/shared/models/tokens/token';
import BigNumber from 'bignumber.js';

export interface PendingUnshieldToken extends Token {
  encryptedAmount: string;
  decryptedWeiAmount: BigNumber;
}

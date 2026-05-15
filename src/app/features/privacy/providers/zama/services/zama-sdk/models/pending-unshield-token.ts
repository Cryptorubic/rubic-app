import { Token } from '@app/shared/models/tokens/token';

export interface PendingUnshieldToken extends Token {
  encryptedAmount: string;
}

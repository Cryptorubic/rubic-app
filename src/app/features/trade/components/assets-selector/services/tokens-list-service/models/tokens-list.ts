import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';

export type TokensList =
  | { tokensToShow: AvailableTokenAmount[] }
  | { customToken: AvailableTokenAmount };

export type TokenAddress = string;

import { TokenAmount } from './TokenAmount';

export interface AvailableTokenAmount extends TokenAmount {
  available: boolean;
  favorite?: boolean;
}

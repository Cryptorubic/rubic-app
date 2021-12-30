import { TokenAmount } from 'src/app/shared/models/tokens/token-amount';

export interface AvailableTokenAmount extends TokenAmount {
  available: boolean;
}

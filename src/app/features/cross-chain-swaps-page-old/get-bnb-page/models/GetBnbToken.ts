import SwapToken from 'src/app/shared/models/tokens/SwapToken';

export interface GetBnbToken extends SwapToken {
  fromAmount: string;
  toAmount: string;
  fee: string;
}

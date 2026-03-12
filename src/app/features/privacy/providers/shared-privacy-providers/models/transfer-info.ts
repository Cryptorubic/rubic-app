import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { SwapAmount } from './swap-info';

export interface PrivateTransferInfo {
  fromAsset: BalanceToken | null;
  fromAmount: SwapAmount | null;
  toAmount: SwapAmount | null;
}

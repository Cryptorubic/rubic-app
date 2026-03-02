import { BalanceToken } from '@app/shared/models/tokens/balance-token';

export interface ShieldedBalanceToken extends BalanceToken {
  /**
   * Date in ms when shielding is finished.
   */
  shieldingCompleteAtMs?: number;

  shieldTxHash?: string;

  ppoiLink?: string;
}

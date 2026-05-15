import { BalanceToken } from '@shared/models/tokens/balance-token';

export interface AvailableTokenAmount extends BalanceToken {
  available: boolean;
}

export interface TokenAmountWithPriceChange extends AvailableTokenAmount {
  sourceRank: number;
  priceChange24h: number;
  priceChange7d: number;
}

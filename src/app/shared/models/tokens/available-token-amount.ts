import { TokenAmount } from 'src/app/shared/models/tokens/token-amount';

export interface AvailableTokenAmount extends TokenAmount {
  available: boolean;
}

export interface TokenAmountWithPriceChange extends AvailableTokenAmount {
  sourceRank: number;
  priceChange24h: number;
  priceChange7d: number;
}

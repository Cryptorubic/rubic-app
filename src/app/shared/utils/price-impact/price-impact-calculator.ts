import BigNumber from 'bignumber.js';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';

export class PriceImpactCalculator {
  public static calculateItPriceImpact(
    fromToken: TokenAmount,
    toToken: TokenAmount,
    fromAmount: BigNumber,
    toAmount: BigNumber
  ): number {
    if (!fromToken?.price || !toToken?.price || !fromAmount?.isFinite() || !toAmount?.isFinite()) {
      return 0;
    }

    const fromTokenCost = fromAmount.multipliedBy(fromToken.price);
    const toTokenCost = toAmount.multipliedBy(toToken.price);
    return fromTokenCost
      .minus(toTokenCost)
      .dividedBy(fromTokenCost)
      .multipliedBy(100)
      .dp(2, BigNumber.ROUND_HALF_UP)
      .toNumber();
  }
}

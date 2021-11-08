import BigNumber from 'bignumber.js';

export class PriceImpactCalculator {
  public static calculatePriceImpact(
    fromTokenPrice: number,
    toTokenPrice: number,
    fromAmount: BigNumber,
    toAmount: BigNumber
  ): number {
    if (!fromTokenPrice || !toTokenPrice || !fromAmount?.isFinite() || !toAmount?.isFinite()) {
      return null;
    }

    const fromTokenCost = fromAmount.multipliedBy(fromTokenPrice);
    const toTokenCost = toAmount.multipliedBy(toTokenPrice);
    return fromTokenCost
      .minus(toTokenCost)
      .dividedBy(fromTokenCost)
      .multipliedBy(100)
      .dp(2, BigNumber.ROUND_HALF_UP)
      .toNumber();
  }
}

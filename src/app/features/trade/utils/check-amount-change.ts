import { BigNumber } from 'bignumber.js';

export function checkAmountChange(
  newWeiAmount: BigNumber,
  oldWeiAmount: BigNumber,
  changePercent: number | BigNumber = 0.5
): boolean {
  const acceptablePercentPriceChange = new BigNumber(changePercent).dividedBy(100);

  const amountPlusPercent = oldWeiAmount.multipliedBy(acceptablePercentPriceChange.plus(1));
  const amountMinusPercent = oldWeiAmount.multipliedBy(
    new BigNumber(1).minus(acceptablePercentPriceChange)
  );

  return newWeiAmount.lt(amountMinusPercent) || newWeiAmount.gt(amountPlusPercent);
}

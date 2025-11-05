import { BlockchainName, PriceTokenAmount, Token } from '@cryptorubic/core';

export function getFromWithoutFee<T extends BlockchainName>(
  from: PriceTokenAmount<T>,
  platformFeePercent: number | undefined
): PriceTokenAmount<T> {
  if (!platformFeePercent) {
    return new PriceTokenAmount({
      ...from.asStructWithPrice,
      weiAmount: from.weiAmount
    });
  }
  const feeAmount = Token.toWei(
    from.tokenAmount.multipliedBy(platformFeePercent).dividedBy(100),
    from.decimals,
    1
  );
  return new PriceTokenAmount({
    ...from.asStructWithPrice,
    weiAmount: from.weiAmount.minus(feeAmount)
  });
}

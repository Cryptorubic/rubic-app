import { PriceTokenAmount } from '@cryptorubic/core';

const DEFAULT_FEE_PERCENT = 0.02;

export function getSolanaFee(from: PriceTokenAmount): number {
  if (!from.price) {
    return DEFAULT_FEE_PERCENT;
  }

  const usdTokenAmount = from.tokenAmount.multipliedBy(from.price);

  if (usdTokenAmount.gt(100)) {
    return DEFAULT_FEE_PERCENT;
  }

  return 0;
}

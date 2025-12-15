import { PriceToken } from '@cryptorubic/core';

export function isWrapUnwrap(fromToken: PriceToken, toToken: PriceToken): boolean {
  return (
    (fromToken.isNative || toToken.isNative) &&
    (fromToken.isWrapped || toToken.isWrapped) &&
    fromToken.blockchain === toToken.blockchain
  );
}

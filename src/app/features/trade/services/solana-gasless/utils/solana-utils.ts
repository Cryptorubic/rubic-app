import { CrossChainTrade, OnChainTrade } from '@cryptorubic/sdk';
import BigNumber from 'bignumber.js';

export function checkAmountGte100Usd(trade: OnChainTrade | CrossChainTrade): boolean {
  const srcAmountUsd = new BigNumber(
    trade.from.tokenAmount.multipliedBy(trade.from.price).toFixed(2)
  );
  const dstAmountUsd = new BigNumber(trade.to.tokenAmount.multipliedBy(trade.to.price).toFixed(2));

  const srcPriceNaN =
    trade.from.price.isNaN() || trade.from.price.isZero() || !trade.from.price.isFinite();
  const dstPriceNaN =
    trade.to.price.isNaN() || trade.to.price.isZero() || !trade.to.price.isFinite();

  if (srcPriceNaN) return dstAmountUsd.gte(100);
  if (dstPriceNaN) return srcAmountUsd.gte(100);

  return srcAmountUsd.gte(100) && dstAmountUsd.gte(100);
}

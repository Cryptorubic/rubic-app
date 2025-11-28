import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
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

import BigNumber from 'bignumber.js';
import { WrappedCrossChainTradeOrNull } from '../models/wrapped-cross-chain-trade-or-null';
import { MaxAmountError, MinAmountError } from '@cryptorubic/web3';

/**
 * Compares two cross chain trades for sorting algorithm.
 */

// eslint-disable-next-line complexity
export function compareCrossChainTrades(
  nextWrappedTrade: WrappedCrossChainTradeOrNull,
  prevWrappedTrade: WrappedCrossChainTradeOrNull,
  nativePriceForNextTrade?: BigNumber,
  nativePriceForPrevTrade?: BigNumber,
  compareWithoutTokenPrice?: boolean
): number {
  if (
    prevWrappedTrade?.error instanceof MinAmountError &&
    nextWrappedTrade?.error instanceof MinAmountError
  ) {
    return prevWrappedTrade.error.minAmount.lte(nextWrappedTrade.error.minAmount) ? 1 : -1;
  }
  if (
    prevWrappedTrade?.error instanceof MaxAmountError &&
    nextWrappedTrade?.error instanceof MaxAmountError
  ) {
    return prevWrappedTrade.error.maxAmount.gte(nextWrappedTrade.error.maxAmount) ? 1 : -1;
  }

  if (!prevWrappedTrade || !prevWrappedTrade?.trade || prevWrappedTrade.error) {
    if (
      nextWrappedTrade?.trade ||
      nextWrappedTrade?.error instanceof MinAmountError ||
      nextWrappedTrade?.error instanceof MaxAmountError
    ) {
      return -1;
    }
    return 1;
  }

  if (
    !nextWrappedTrade ||
    nextWrappedTrade.error ||
    nextWrappedTrade?.trade?.to?.tokenAmount.lte(0)
  ) {
    return 1;
  }

  if (compareWithoutTokenPrice) {
    const prevTradeToTokenAmount = prevWrappedTrade?.trade.to.tokenAmount;
    const nextTradeToTokenAmount = nextWrappedTrade?.trade?.to.tokenAmount;

    if (!nextTradeToTokenAmount) {
      return 1;
    }
    if (!prevTradeToTokenAmount) {
      return -1;
    }
    return prevTradeToTokenAmount.lte(nextTradeToTokenAmount) ? -1 : 1;
  } else {
    const fromUsd = prevWrappedTrade?.trade.getUsdPrice(nativePriceForPrevTrade);

    const toUsd = nextWrappedTrade?.trade?.getUsdPrice(nativePriceForNextTrade);

    if (!toUsd || !toUsd.isFinite()) {
      return 1;
    }
    if (!fromUsd || !fromUsd.isFinite()) {
      return -1;
    }
    return fromUsd.lte(toUsd) ? -1 : 1;
  }
}

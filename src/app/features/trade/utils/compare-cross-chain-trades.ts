import { WrappedCrossChainTradeOrNull } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/models/wrapped-cross-chain-trade-or-null';
import { CROSS_CHAIN_TRADE_TYPE } from '@cryptorubic/core';
import { MaxAmountError, MinAmountError } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';

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

    // @TODO remove after lifi fix
    if (prevTradeToTokenAmount.eq(nextTradeToTokenAmount)) {
      if (prevWrappedTrade.trade.type === CROSS_CHAIN_TRADE_TYPE.LIFI) return -1;
      if (nextWrappedTrade.trade.type === CROSS_CHAIN_TRADE_TYPE.LIFI) return 1;
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

    // @TODO remove after lifi fix
    if (fromUsd.dp(2).eq(toUsd.dp(2))) {
      if (prevWrappedTrade.trade.type === CROSS_CHAIN_TRADE_TYPE.LIFI) return -1;
      if (nextWrappedTrade.trade.type === CROSS_CHAIN_TRADE_TYPE.LIFI) return 1;
    }

    return fromUsd.lte(toUsd) ? -1 : 1;
  }
}

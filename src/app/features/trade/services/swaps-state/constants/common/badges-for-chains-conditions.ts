import { BLOCKCHAIN_NAME, CrossChainTrade, OnChainTrade } from 'rubic-sdk';

export function showBlastGoldPromoLabel(trade: CrossChainTrade): boolean {
  return (
    trade.to.blockchain === BLOCKCHAIN_NAME.BLAST &&
    trade.feeInfo?.rubicProxy?.fixedFee?.amount.gt(0)
  );
}

export function showTaikoPointsPromoLabel(trade: CrossChainTrade): boolean {
  return (
    (trade.to.blockchain === BLOCKCHAIN_NAME.TAIKO ||
      trade.from.blockchain === BLOCKCHAIN_NAME.TAIKO) &&
    trade.feeInfo?.rubicProxy?.fixedFee?.amount.gt(0)
  );
}

export function showScrollMarksPromoLabel(trade: CrossChainTrade): boolean {
  const promoTokens = ['weth', 'usdt', 'usdc', 'wsteth', 'wrseth', 'stone'];
  const isPromoToken = trade.to.isNative || promoTokens.includes(trade.to.symbol.toLowerCase());

  return (
    trade.to.blockchain === BLOCKCHAIN_NAME.SCROLL &&
    trade.feeInfo?.rubicProxy?.fixedFee?.amount.gt(0) &&
    isPromoToken
  );
}

export function showZkLinkPointsLabel(trade: OnChainTrade | CrossChainTrade): boolean {
  return trade.to.blockchain === BLOCKCHAIN_NAME.ZK_LINK;
}

export function showMerlinLabel(trade: OnChainTrade | CrossChainTrade): boolean {
  return (
    trade.to.blockchain === BLOCKCHAIN_NAME.MERLIN ||
    trade.from.blockchain === BLOCKCHAIN_NAME.MERLIN
  );
}

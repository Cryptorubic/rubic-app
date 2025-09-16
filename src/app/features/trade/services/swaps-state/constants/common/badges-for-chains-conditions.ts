import { BLOCKCHAIN_NAME, CrossChainTrade, OnChainTrade } from '@cryptorubic/sdk';

export function showTaikoPointsPromoLabel(trade: CrossChainTrade): boolean {
  return (
    trade.to.blockchain === BLOCKCHAIN_NAME.TAIKO || trade.from.blockchain === BLOCKCHAIN_NAME.TAIKO
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

export function showSolanaGaslessLabel(trade: OnChainTrade | CrossChainTrade): boolean {
  return trade.from.blockchain === BLOCKCHAIN_NAME.SOLANA;
}

import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { crossChainTransferTradeSupportedProviders } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/constans/transfer-trade-supported-providers';
import { onChainTransferTradeSupportedProviders } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-transfer-trade/constants/on-chain-transfer-trade-supported-providers';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

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
  const isTransferTrade =
    crossChainTransferTradeSupportedProviders.some(providerName => providerName === trade.type) ||
    onChainTransferTradeSupportedProviders.some(providerName => providerName === trade.type);
  if (trade.from.blockchain === BLOCKCHAIN_NAME.SOLANA && !isTransferTrade) {
    return true;
  }
  return false;
}

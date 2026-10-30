import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

export function showNoSlippageLabelArbitrumBridge(trade: CrossChainTrade | OnChainTrade): boolean {
  return trade.from.symbol.toLowerCase() === 'rbc' && trade.to.symbol.toLowerCase() === 'rbc';
}

export function showAttentionLabelArbitrumBridge(trade: CrossChainTrade | OnChainTrade): boolean {
  return (
    trade.from.blockchain === BLOCKCHAIN_NAME.ARBITRUM &&
    trade.to.blockchain === BLOCKCHAIN_NAME.ETHEREUM
  );
}

export function showBerachainLabel(trade: CrossChainTrade): boolean {
  const withBerachain =
    trade.to.blockchain === BLOCKCHAIN_NAME.BERACHAIN ||
    trade.from.blockchain === BLOCKCHAIN_NAME.BERACHAIN;

  return withBerachain && trade.from.tokenAmount.multipliedBy(trade.from.price).gt(20);
}

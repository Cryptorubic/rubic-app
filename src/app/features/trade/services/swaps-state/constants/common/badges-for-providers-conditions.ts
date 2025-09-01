import { BLOCKCHAIN_NAME, CrossChainTrade, OnChainTrade } from '@cryptorubic/sdk';

export function showNoSlippageLabelArbitrumBridge(trade: CrossChainTrade | OnChainTrade): boolean {
  return trade.from.symbol.toLowerCase() === 'rbc' && trade.to.symbol.toLowerCase() === 'rbc';
}

export function showAttentionLabelArbitrumBridge(trade: CrossChainTrade | OnChainTrade): boolean {
  return (
    trade.from.blockchain === BLOCKCHAIN_NAME.ARBITRUM &&
    trade.to.blockchain === BLOCKCHAIN_NAME.ETHEREUM
  );
}

export function showXyBlastPromoLabel(trade: CrossChainTrade): boolean {
  return trade.to.blockchain === BLOCKCHAIN_NAME.BLAST && trade.bridgeType === 'ypool';
}

export function showBerachainLabel(trade: CrossChainTrade): boolean {
  const withBerachain =
    trade.to.blockchain === BLOCKCHAIN_NAME.BERACHAIN ||
    trade.from.blockchain === BLOCKCHAIN_NAME.BERACHAIN;

  return withBerachain && trade.from.tokenAmount.multipliedBy(trade.from.price).gt(20);
}

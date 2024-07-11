import { BLOCKCHAIN_NAME, CrossChainTrade, OnChainTrade } from 'rubic-sdk';

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

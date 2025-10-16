import {
  BLOCKCHAIN_NAME,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTrade,
  OnChainTrade
} from '@cryptorubic/sdk';

export function isArbitrumBridgeRbcTrade(trade: CrossChainTrade | OnChainTrade): boolean {
  return (
    trade.type === CROSS_CHAIN_TRADE_TYPE.ARBITRUM &&
    trade.from.blockchain === BLOCKCHAIN_NAME.ARBITRUM &&
    trade.to.blockchain === BLOCKCHAIN_NAME.ETHEREUM
  );
}

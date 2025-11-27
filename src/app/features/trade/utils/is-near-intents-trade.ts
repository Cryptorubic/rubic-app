import {
  BLOCKCHAIN_NAME,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTrade,
  OnChainTrade
} from '@cryptorubic/sdk';

export function isNearIntentsTrade(trade: CrossChainTrade | OnChainTrade): boolean {
  return (
    trade.type === CROSS_CHAIN_TRADE_TYPE.NEAR_INTENTS &&
    (trade.from.blockchain === BLOCKCHAIN_NAME.ZCASH ||
      trade.to.blockchain === BLOCKCHAIN_NAME.ZCASH)
  );
}

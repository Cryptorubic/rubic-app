import {
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  ON_CHAIN_TRADE_TYPE,
  OnChainTradeType
} from '@cryptorubic/core';

export function isClearswap(
  tradeType: CrossChainTradeType | OnChainTradeType | null | undefined
): boolean {
  return (
    tradeType === CROSS_CHAIN_TRADE_TYPE.CLEARSWAP || tradeType === ON_CHAIN_TRADE_TYPE.CLEARSWAP
  );
}

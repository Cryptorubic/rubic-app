import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '@cryptorubic/core';

/**
 * On-chain trade types where funds are delivered asynchronously by a solver,
 * so success must be determined via status polling instead of the source tx receipt.
 */
export const ASYNC_ON_CHAIN_TRADE_TYPES: OnChainTradeType[] = [ON_CHAIN_TRADE_TYPE.LAYERSWAP];

export function isAsyncOnChainTradeType(tradeType: unknown): boolean {
  return ASYNC_ON_CHAIN_TRADE_TYPES.includes(tradeType as OnChainTradeType);
}

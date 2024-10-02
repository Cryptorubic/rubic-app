import {
  CrossChainFeeType,
  CrossChainTokenType
} from '@features/trade/services/proxy-fee-service/models/cross-chain-fee-types';

export const crossChainTokenTypeMapping: Record<CrossChainTokenType, CrossChainFeeType> = {
  native_eth_native: 'tokenSwap',
  native_eth_native_eth: 'sameNativeSwap',
  native_eth_stable: 'nativeStableSwap',
  native_eth_token: 'tokenSwap',
  native_eth_wNative: 'tokenSwap',
  native_native: 'tokenSwap',
  native_native_eth: 'tokenSwap',
  native_stable: 'nativeStableSwap',
  native_token: 'tokenSwap',
  native_wNative: 'tokenSwap',
  stable_native: 'nativeStableSwap',
  stable_native_eth: 'nativeStableSwap',
  stable_stable: 'stableSwap',
  stable_token: 'stableTokenSwap',
  stable_wNative: 'stableWnativeSwap',
  token_native: 'tokenSwap',
  token_native_eth: 'tokenSwap',
  token_stable: 'stableTokenSwap',
  token_token: 'tokenSwap',
  token_wNative: 'tokenSwap',
  wNative_native: 'tokenSwap',
  wNative_native_eth: 'tokenSwap',
  wNative_stable: 'stableWnativeSwap',
  wNative_token: 'tokenSwap',
  wNative_wNative: 'tokenSwap'
};

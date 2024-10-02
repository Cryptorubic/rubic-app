import {
  OnChainTokenTypes,
  OnChainTypes
} from '@features/trade/services/proxy-fee-service/models/on-chain-fee-types';

export const onChainTokenTypeMapping: Record<OnChainTokenTypes, OnChainTypes> = {
  wNative_wNative: 'tokenSwap',
  wNative_stable: 'stableWnativeSwap',
  wNative_token: 'tokenSwap',
  wNative_native: 'tokenSwap',
  native_stable: 'nativeStableSwap',
  native_token: 'tokenSwap',
  native_wNative: 'tokenSwap',
  stable_native: 'nativeStableSwap',
  stable_wNative: 'stableWnativeSwap',
  stable_stable: 'stableSwap',
  stable_token: 'stableTokenSwap',
  token_native: 'tokenSwap',
  token_wNative: 'tokenSwap',
  token_stable: 'stableTokenSwap',
  token_token: 'tokenSwap'
};

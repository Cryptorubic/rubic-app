import { TokenType } from '@features/trade/services/proxy-service/models/token-type';
import { BlockchainStatus } from '@core/services/backend/platform-configuration/models/blockchain-status';
import { PercentTypes } from '@features/trade/services/proxy-service/models/percent-types';

export type OnChainTypes =
  | 'nativeStableSwap'
  | 'stableSwap'
  | 'stableTokenSwap'
  | 'stableWnativeSwap'
  | 'tokenSwap';

type OnChainTokenType = Exclude<TokenType, 'native_eth'>;

export type OnChainTokenTypes = Exclude<`${OnChainTokenType}_${OnChainTokenType}`, 'native_native'>;

export const onChainFee: Record<OnChainTokenTypes, OnChainTypes> = {
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

export type OnChainTierFeeType = `${OnChainTypes}_${BlockchainStatus['tier']}`;

type OnChainTierFee = Record<
  OnChainTierFeeType,
  PercentTypes | { limit: number; type: PercentTypes }[]
>;

export const onChainFees: OnChainTierFee = {
  nativeStableSwap_1: 'zeroFee',
  nativeStableSwap_2: [{ limit: 100, type: 'onePercent' }],
  stableSwap_1: 'zeroFee',
  stableSwap_2: 'zeroFee',
  stableTokenSwap_1: 'zeroFee',
  stableTokenSwap_2: 'zeroFee',
  stableWnativeSwap_1: 'zeroFee',
  stableWnativeSwap_2: 'zeroFee',
  tokenSwap_1: [
    { limit: 100, type: 'twoPercent' },
    { limit: 100, type: 'onePercent' }
  ],
  tokenSwap_2: [{ limit: 100, type: 'twoPercent' }]
};

import { TokenType } from '@features/trade/services/proxy-service/models/token-type';
import { BlockchainStatus } from '@core/services/backend/platform-configuration/models/blockchain-status';
import { PercentTypes } from '@features/trade/services/proxy-service/models/percent-types';

export type CrossChainTypes =
  | 'nativeStableSwap'
  | 'sameNativeSwap'
  | 'stableSwap'
  | 'stableTokenSwap'
  | 'stableWnativeSwap'
  | 'tokenSwap'
  | 'sameTokenSwap';

export type CrossChainTokenTypes = `${TokenType}_${TokenType}`;

export const crossChainFee: Record<CrossChainTokenTypes, CrossChainTypes> = {
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

export type CrossChainTierFeeType =
  `${CrossChainTypes}_${BlockchainStatus['tier']}_${BlockchainStatus['tier']}`;

type CrossChainTierFee = Record<
  CrossChainTierFeeType,
  PercentTypes | { limit: number; type: PercentTypes }[]
>;

export const crossChainFees: CrossChainTierFee = {
  nativeStableSwap_1_1: 'onePercent',
  nativeStableSwap_1_2: 'twoPercent',
  nativeStableSwap_2_1: [
    { limit: 100, type: 'onePercent' },
    { limit: 5_000, type: 'twoPercent' }
  ],
  nativeStableSwap_2_2: [
    { limit: 100, type: 'onePercent' },
    { limit: 5_000, type: 'twoPercent' }
  ],
  sameNativeSwap_1_1: 'zeroFee',
  sameNativeSwap_1_2: 'twoPercent',
  sameNativeSwap_2_1: 'twoPercent',
  sameNativeSwap_2_2: 'twoPercent',
  sameTokenSwap_1_1: 'onePercent',
  sameTokenSwap_1_2: 'twoPercent',
  sameTokenSwap_2_1: 'twoPercent',
  sameTokenSwap_2_2: 'twoPercent',
  stableSwap_1_1: 'zeroFee',
  stableSwap_1_2: 'twoPercent',
  stableSwap_2_1: 'twoPercent',
  stableSwap_2_2: 'twoPercent',
  stableTokenSwap_1_1: [
    { limit: 100, type: 'onePercent' },
    { limit: 25_000, type: 'twoPercent' }
  ],
  stableTokenSwap_1_2: 'twoPercent',
  stableTokenSwap_2_1: 'twoPercent',
  stableTokenSwap_2_2: 'twoPercent',
  stableWnativeSwap_1_1: [
    { limit: 100, type: 'onePercent' },
    { limit: 5_000, type: 'twoPercent' }
  ],
  stableWnativeSwap_1_2: [
    { limit: 100, type: 'onePercent' },
    { limit: 10_000, type: 'twoPercent' }
  ],
  stableWnativeSwap_2_1: [
    { limit: 100, type: 'onePercent' },
    { limit: 10_000, type: 'twoPercent' }
  ],
  stableWnativeSwap_2_2: [
    { limit: 100, type: 'onePercent' },
    { limit: 10_000, type: 'twoPercent' }
  ],
  tokenSwap_1_1: 'twoPercent',
  tokenSwap_1_2: 'twoPercent',
  tokenSwap_2_1: 'twoPercent',
  tokenSwap_2_2: 'twoPercent'
};

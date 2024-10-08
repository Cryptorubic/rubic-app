import { CrossChainTierFee } from '@features/trade/services/proxy-fee-service/models/cross-chain-fee-types';

export const crossChainTokenTierMapping: CrossChainTierFee = {
  nativeStableSwap_1_1: [
    { limit: 100, type: 'onePercent' },
    { limit: 10_000, type: 'twoPercent' }
  ],
  nativeStableSwap_1_2: [
    { limit: 100, type: 'onePercent' },
    { limit: 10_000, type: 'twoPercent' }
  ],
  nativeStableSwap_2_1: [
    { limit: 100, type: 'onePercent' },
    { limit: 10_000, type: 'twoPercent' }
  ],
  nativeStableSwap_2_2: [
    { limit: 100, type: 'onePercent' },
    { limit: 10_000, type: 'twoPercent' }
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

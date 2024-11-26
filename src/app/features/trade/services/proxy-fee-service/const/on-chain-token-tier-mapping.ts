import { OnChainTierFee } from '@features/trade/services/proxy-fee-service/models/on-chain-fee-types';

export const onChainTokenTierMapping: OnChainTierFee = {
  nativeStableSwap_1: 'zeroFee',
  nativeStableSwap_2: [{ limit: 100, type: 'twoPercent' }],
  stableSwap_1: 'zeroFee',
  stableSwap_2: 'zeroFee',
  stableTokenSwap_1: [{ limit: 100, type: 'onePercent' }],
  stableTokenSwap_2: [{ limit: 100, type: 'onePercent' }],
  stableWnativeSwap_1: [{ limit: 100, type: 'onePercent' }],
  stableWnativeSwap_2: [{ limit: 100, type: 'onePercent' }],
  tokenSwap_1: [{ limit: 100, type: 'twoPercent' }],
  tokenSwap_2: [{ limit: 100, type: 'twoPercent' }]
};

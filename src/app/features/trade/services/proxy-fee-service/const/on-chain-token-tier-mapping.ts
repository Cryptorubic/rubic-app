import { OnChainTierFee } from '@features/trade/services/proxy-fee-service/models/on-chain-fee-types';

export const onChainTokenTierMapping: OnChainTierFee = {
  nativeStableSwap_1: 'zeroFee',
  nativeStableSwap_2: [{ limit: 100, type: 'twoPercent' }],
  stableSwap_1: 'zeroFee',
  stableSwap_2: 'zeroFee',
  stableTokenSwap_1: 'zeroFee',
  stableTokenSwap_2: 'zeroFee',
  stableWnativeSwap_1: 'zeroFee',
  stableWnativeSwap_2: 'zeroFee',
  tokenSwap_1: [{ limit: 100, type: 'onePercent' }],
  tokenSwap_2: [{ limit: 100, type: 'twoPercent' }]
};

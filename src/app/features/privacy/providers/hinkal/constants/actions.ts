import { PrivateAction } from '@app/features/privacy/constants/private-mode-tx-types';
import { HINKAL_SUPPORTED_CHAINS, HinkalSupportedChain } from './chains';

export const HINKAL_SUPPORTED_ACTIONS = HINKAL_SUPPORTED_CHAINS.reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: ['Swap', 'Transfer']
  }),
  {} as Record<HinkalSupportedChain, Readonly<PrivateAction[]>>
);

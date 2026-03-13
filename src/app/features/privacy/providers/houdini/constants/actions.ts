import { PrivateAction } from '@app/features/privacy/constants/private-mode-tx-types';
import { HOUDINI_SUPPORTED_CHAINS, HoudiniSupportedChain } from './chains';

export const HOUDINI_SUPPORTED_ACTIONS = HOUDINI_SUPPORTED_CHAINS.reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: ['Swap', 'Bridge']
  }),
  {} as Record<HoudiniSupportedChain, Readonly<PrivateAction[]>>
);

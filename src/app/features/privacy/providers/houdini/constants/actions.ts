import { PrivateAction } from '@app/features/privacy/constants/private-mode-tx-types';
import { HOUDINI_SUPPORTED_CHAINS, HoudiniSupportedChain } from './chains';

export const HOUDINI_SUPPORTED_ACTIONS = {
  ...(HOUDINI_SUPPORTED_CHAINS.reduce(
    (obj, key: HoudiniSupportedChain) => ({ ...obj, [key]: ['Swap'] }),
    {}
  ) as Record<HoudiniSupportedChain, Readonly<PrivateAction[]>>)
} as const;

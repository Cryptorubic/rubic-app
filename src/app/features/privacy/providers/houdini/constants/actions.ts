import { PrivateAction } from '@app/features/privacy/constants/private-mode-tx-types';
import { HoudiniSupportedChain } from './chains';

export const HOUDINI_SUPPORTED_ACTIONS: Record<HoudiniSupportedChain, Readonly<PrivateAction[]>> = {
  ETH: ['Swap']
} as const;

import { PrivateAction } from '@app/features/privacy/constants/private-mode-tx-types';
import { HoudiniSupportedChain } from './chains';

// @TODO_1712 добавить полный спиок сетей
export const HOUDINI_SUPPORTED_ACTIONS: Record<HoudiniSupportedChain, Readonly<PrivateAction[]>> = {
  ETH: ['Swap', 'Bridge']
} as const;

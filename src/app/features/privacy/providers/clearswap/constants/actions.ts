import { PrivateAction } from '@app/features/privacy/constants/private-mode-tx-types';
import { ClearswapSupportedChain } from './clearswap-supported';

export const CLEARSWAP_SUPPORTED_ACTIONS: Record<
  ClearswapSupportedChain,
  Readonly<PrivateAction[]>
> = {
  TRON: ['Swap', 'Transfer']
} as const;

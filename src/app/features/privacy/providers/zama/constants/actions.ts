import { PrivateAction } from '@app/features/privacy/constants/private-mode-tx-types';
import { ZamaSupportedChain } from './chains';

export const ZAMA_SUPPORTED_ACTIONS: Record<ZamaSupportedChain, Readonly<PrivateAction[]>> = {
  ETH: ['Transfer']
};

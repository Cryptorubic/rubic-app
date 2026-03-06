import { PrivateAction } from '@app/features/privacy/constants/private-mode-tx-types';
import { PrivacycashSupportedChain } from './chains';

export const PRIVACYCAH_SUPPORTED_ACTIONS: Record<
  PrivacycashSupportedChain,
  Readonly<PrivateAction[]>
> = {
  SOLANA: ['Swap', 'Transfer']
} as const;

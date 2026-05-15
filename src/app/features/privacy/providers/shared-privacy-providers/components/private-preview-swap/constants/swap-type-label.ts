import { PrivateSwapType } from '../models/preview-swap-options';

export const SWAP_TYPE_LABEL: Record<PrivateSwapType, string> = {
  shield: 'Shield',
  unshield: 'Private Transfer',
  transfer: 'Private transfer',
  swap: 'Private swap',
  refund: 'Refund'
};

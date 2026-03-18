import { PrivateSwapType } from '../models/preview-swap-options';

export const SWAP_TYPE_LABEL: Record<PrivateSwapType, string> = {
  shield: 'Hide tokens',
  unshield: 'Reveal tokens',
  transfer: 'Private transfer',
  swap: 'Private swap',
  refund: 'Refund tokens'
};

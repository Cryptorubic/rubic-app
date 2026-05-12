import { PrivateSwapType } from '../models/preview-swap-options';

export const SWAP_TYPE_LABEL: Record<PrivateSwapType, string> = {
  shield: 'Deposit',
  unshield: 'Stealth Send',
  transfer: 'Private transfer',
  swap: 'Private swap',
  refund: 'Refund'
};

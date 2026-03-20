import { PrivateSwapType } from '../models/preview-swap-options';

export const SWAP_TYPE_LABEL: Record<PrivateSwapType, string> = {
  shield: 'Shield tokens',
  unshield: 'Unshield tokens',
  transfer: 'Transfer tokens',
  swap: 'Swap tokens',
  refund: 'Refund tokens'
};

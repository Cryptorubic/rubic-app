import { promoState } from '@features/testnet-promo/constants/promo-state';

export const pageState = {
  ...promoState,
  noWallet: 'noWallet'
} as const;

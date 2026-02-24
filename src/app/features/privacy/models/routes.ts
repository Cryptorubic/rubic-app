import { PrivateTradeType } from '../constants/private-trade-types';

export const PRIVATE_MODE_URLS: Record<PrivateTradeType, string> = {
  HINKAL: 'hinkal',
  PRIVACY_CASH: 'privacy-cash',
  RAILGUN: 'railgun',
  ZAMA: 'zama'
} as const;

export type PrivareProviderUrl = (typeof PRIVATE_MODE_URLS)[keyof typeof PRIVATE_MODE_URLS];

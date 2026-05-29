import { PrivateTradeType } from '../constants/private-trade-types';

export const PRIVATE_MODE_URLS = {
  HINKAL: 'hinkal',
  PRIVACY_CASH: 'privacy-cash',
  RAILGUN: 'railgun',
  ZAMA: 'zama',
  CLEARSWAP: 'clearswap',
  HOUDINI: 'houdini'
} as const satisfies Record<PrivateTradeType, string>;

export type PrivateProviderUrl = (typeof PRIVATE_MODE_URLS)[keyof typeof PRIVATE_MODE_URLS];

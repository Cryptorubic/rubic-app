import { PrivateTradeType } from './private-trade-types';

export const PRIVATE_PROVIDERS_ICONS: Record<
  PrivateTradeType,
  `assets/images/private-swaps/common/${string}`
> = {
  HINKAL: 'assets/images/private-swaps/common/hinkal.svg',
  PRIVACY_CASH: 'assets/images/private-swaps/common/privacy-cash.svg',
  RAILGUN: 'assets/images/private-swaps/common/railgun.svg',
  ZAMA: 'assets/images/private-swaps/common/zama.svg'
} as const;

import { PrivateProviderInfoUI } from '../models/provider-info';
import { PRIVATE_MODE_URLS } from '../models/routes';
import { PRIVATE_TRADE_TYPE } from './private-trade-types';

export const PRIVATE_PROVIDERS_UI: PrivateProviderInfoUI[] = [
  {
    feeSize: 'low',
    url: PRIVATE_MODE_URLS.ZAMA,
    icon: 'assets/images/private-swaps/common/zama.svg',
    name: PRIVATE_TRADE_TYPE.ZAMA,
    privacyType: 'Zero-Knowledge Proof',
    securityPercent: 100
  },
  {
    feeSize: 'average',
    url: PRIVATE_MODE_URLS.RAILGUN,
    icon: 'assets/images/private-swaps/common/railgun.svg',
    name: PRIVATE_TRADE_TYPE.RAILGUN,
    privacyType: 'Confidential UTXO',
    shieldingDurationSecs: 60,
    securityPercent: 100
  },
  {
    feeSize: 'high',
    url: PRIVATE_MODE_URLS.HINKAL,
    icon: 'assets/images/private-swaps/common/hinkal.svg',
    name: PRIVATE_TRADE_TYPE.HINKAL,
    privacyType: 'Encrypted Computation',
    securityPercent: 100
  },
  {
    feeSize: 'high',
    url: PRIVATE_MODE_URLS.PRIVACY_CASH,
    icon: 'assets/images/private-swaps/common/hinkal.svg',
    name: PRIVATE_TRADE_TYPE.PRIVACY_CASH,
    privacyType: 'Zero-Knowledge Proof',
    securityPercent: 100
  }
];

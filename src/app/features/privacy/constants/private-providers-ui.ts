import { PrivateProviderInfoUI } from '../models/provider-info';
import { PRIVATE_MODE_URLS } from '../models/routes';
import { PRIVATE_PROVIDERS_ICONS } from './private-providers-icons';
import { PRIVATE_TRADE_TYPE } from './private-trade-types';

export const PRIVATE_PROVIDERS_UI: PrivateProviderInfoUI[] = [
  {
    feeSize: 'low',
    url: PRIVATE_MODE_URLS.ZAMA,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.ZAMA],
    name: PRIVATE_TRADE_TYPE.ZAMA,
    privacyType: 'Zero-Knowledge Proof',
    securityPercent: 100
  },
  {
    feeSize: 'average',
    url: PRIVATE_MODE_URLS.RAILGUN,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.RAILGUN],
    name: PRIVATE_TRADE_TYPE.RAILGUN,
    privacyType: 'Confidential UTXO',
    shieldingDurationSecs: 60,
    securityPercent: 100
  },
  {
    feeSize: 'high',
    url: PRIVATE_MODE_URLS.HINKAL,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.HINKAL],
    name: PRIVATE_TRADE_TYPE.HINKAL,
    privacyType: 'Encrypted Computation',
    securityPercent: 100
  },
  {
    feeSize: 'high',
    url: PRIVATE_MODE_URLS.PRIVACY_CASH,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.PRIVACY_CASH],
    name: PRIVATE_TRADE_TYPE.PRIVACY_CASH,
    privacyType: 'Zero-Knowledge Proof',
    securityPercent: 100
  }
];

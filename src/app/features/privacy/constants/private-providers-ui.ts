import { PrivateProviderRawInfo } from '../models/provider-info';
import { PRIVATE_MODE_URLS } from '../models/routes';
import { addr_to_symbol_map } from '../providers/privacycash/constants/privacycash-consts';
import { toPrivacyCashTokenAddr } from '../providers/privacycash/utils/converter';
import { PrivateSwapInfo } from '../providers/shared-privacy-providers/models/swap-info';
import { PrivacyApiService } from '../services/privacy-api.service';
import { PrivateAction } from './private-mode-tx-types';
import { PRIVATE_PROVIDERS_ICONS } from './private-providers-icons';
import { PRIVATE_TRADE_TYPE, PrivateTradeType } from './private-trade-types';

const PRIVATE_PROVIDERS_DEFAULT_CONFIG: Record<PrivateTradeType, PrivateProviderRawInfo> = {
  ZAMA: {
    getMinAmountUsd: () => 0,
    getFeeSize: () => Promise.resolve('0.008-0.8$'),
    url: PRIVATE_MODE_URLS.ZAMA,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.ZAMA],
    name: PRIVATE_TRADE_TYPE.ZAMA,
    uiName: 'Zama',
    privacyType: 'FHE',
    security: 4
  },
  RAILGUN: {
    getMinAmountUsd: () => 0,
    getFeeSize: () => Promise.resolve('0.25%'),
    url: PRIVATE_MODE_URLS.RAILGUN,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.RAILGUN],
    name: PRIVATE_TRADE_TYPE.RAILGUN,
    uiName: 'Railgun',
    privacyType: 'ZK SNARKs',
    warning: {
      message: '1 hour shielding',
      hint: 'This is a one-hour protective quarantine during which the system verifies the “purity” of the funds and prepares ZK evidence. During this period, only refunds to the original wallet are permitted, full anonymity is enabled once the process is complete.'
    },
    security: 4
  },
  HINKAL: {
    getMinAmountUsd: () => 0,
    getFeeSize: (action: PrivateAction) => Promise.resolve(action === 'Transfer' ? '0%' : '0.3%'),
    url: PRIVATE_MODE_URLS.HINKAL,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.HINKAL],
    name: PRIVATE_TRADE_TYPE.HINKAL,
    uiName: 'Hinkal',
    privacyType: 'ZK',
    security: 4
  },
  PRIVACY_CASH: {
    getMinAmountUsd: (action: PrivateAction) => (action === 'Swap' ? 10 : 0),
    getFeeSize: async (
      _action: PrivateAction,
      formValue: PrivateSwapInfo,
      privacyApiService: PrivacyApiService
    ) => {
      if (!formValue.fromAsset) return Promise.resolve('0.35%+0.6$');
      try {
        const resp = await privacyApiService.fetchPrivacyCashFees();
        const symbol =
          addr_to_symbol_map[toPrivacyCashTokenAddr(formValue.fromAsset.address).toLowerCase()];
        const rentFee = resp.rent_fees[symbol].toFixed(3);
        const fullFee = `0.35%+${rentFee}${symbol}`;
        return fullFee;
      } catch (err) {
        return Promise.resolve('0.35%+0.6$');
      }
    },
    url: PRIVATE_MODE_URLS.PRIVACY_CASH,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.PRIVACY_CASH],
    name: PRIVATE_TRADE_TYPE.PRIVACY_CASH,
    uiName: 'PrivacyCash',
    privacyType: 'ZK',
    security: 2
  },
  CLEARSWAP: {
    getMinAmountUsd: () => 49,
    getFeeSize: () => Promise.resolve('2.5%'),
    url: PRIVATE_MODE_URLS.CLEARSWAP,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.CLEARSWAP],
    name: PRIVATE_TRADE_TYPE.CLEARSWAP,
    privacyType: 'Dual exchange system',
    uiName: 'Clearswap',
    security: 1
  },
  HOUDINI: {
    getMinAmountUsd: () => 50,
    getFeeSize: () => Promise.resolve('0.8%'),
    url: PRIVATE_MODE_URLS.HOUDINI,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.HOUDINI],
    name: PRIVATE_TRADE_TYPE.HOUDINI,
    privacyType: 'Dual exchange system +Randomized L1',
    uiName: 'Houdini',
    warning: {
      message: 'long swap',
      hint: 'Private transactions take 20–40 minutes on average.'
    },
    security: 3
  }
};

export const PRIVATE_PROVIDERS_UI = Object.values(PRIVATE_PROVIDERS_DEFAULT_CONFIG);

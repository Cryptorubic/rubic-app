import { PrivateProviderRawInfo } from '../models/provider-info';
import { PRIVATE_MODE_URLS } from '../models/routes';
import { PrivateSwapInfo } from '../providers/shared-privacy-providers/models/swap-info';
import { PrivacyApiService } from '../services/privacy-api.service';
import { PRIVATE_MODE_TAB, PrivateModeTab } from './private-mode-tab';
import { PRIVATE_PROVIDERS_ICONS } from './private-providers-icons';
import { PRIVATE_TRADE_TYPE, PrivateTradeType } from './private-trade-types';

const ACTION_STEPS: Record<'ONE' | 'TWO' | 'THREE', { steps: number; hint: string }> = {
  ONE: { steps: 1, hint: 'The action completes in 1 step.' },
  TWO: { steps: 2, hint: 'Completing the target action requires 2 steps.' },
  THREE: { steps: 3, hint: 'Completing the target action requires 3 steps.' }
};

const PRIVATE_PROVIDERS_DEFAULT_CONFIG: Record<PrivateTradeType, PrivateProviderRawInfo> = {
  ZAMA: {
    //getMinAmountUsd: () => 0,
    getExecutionStepsInfo: () => ACTION_STEPS.THREE,
    getFeeInfo: () => Promise.resolve({ feeSize: 'zero fees', feeRate: 0 }),
    url: PRIVATE_MODE_URLS.ZAMA,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.ZAMA],
    name: PRIVATE_TRADE_TYPE.ZAMA,
    uiName: 'Zama',
    privacyType: 'FHE, ZK, MPC',
    security: 3,
    executionTimeRate: 1
  },
  RAILGUN: {
    //getMinAmountUsd: () => 0,
    getExecutionStepsInfo: () => ACTION_STEPS.THREE,
    getFeeInfo: () => Promise.resolve({ feeSize: '0.5% shield/unshield fee', feeRate: 2 }),
    url: PRIVATE_MODE_URLS.RAILGUN,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.RAILGUN],
    name: PRIVATE_TRADE_TYPE.RAILGUN,
    uiName: 'Railgun',
    privacyType: 'ZK',
    warning: {
      message: '1 hour shielding',
      hint: 'This is a one-hour protective quarantine during which the system verifies the “purity” of the funds and prepares ZK evidence. During this period, only refunds to the original wallet are permitted, full anonymity is enabled once the process is complete.'
    },
    security: 4,
    executionTimeRate: 3
  },
  HINKAL: {
    //getMinAmountUsd: () => 0,
    getExecutionStepsInfo: () => ACTION_STEPS.THREE,
    getFeeInfo: (tab: PrivateModeTab) =>
      Promise.resolve(
        tab === PRIVATE_MODE_TAB.TRANSFER
          ? { feeSize: '0.05%', feeRate: 1 }
          : { feeSize: 'zero fees', feeRate: 0 }
      ),
    url: PRIVATE_MODE_URLS.HINKAL,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.HINKAL],
    name: PRIVATE_TRADE_TYPE.HINKAL,
    uiName: 'Hinkal',
    privacyType: 'ZK',
    security: 3.55,
    executionTimeRate: 1
  },
  PRIVACY_CASH: {
    //getMinAmountUsd: (tab: PrivateModeTab) => (tab === PRIVATE_MODE_TAB.TRANSFER ? 0 : 10),
    getExecutionStepsInfo: (tab: PrivateModeTab) =>
      tab === PRIVATE_MODE_TAB.TRANSFER ? ACTION_STEPS.TWO : ACTION_STEPS.THREE,
    getFeeInfo: async (
      tab: PrivateModeTab,
      _formValue: PrivateSwapInfo,
      _privacyApiService: PrivacyApiService
    ) => {
      if (tab === PRIVATE_MODE_TAB.ON_CHAIN)
        return { feeSize: '0.35%+ rent fees+0.0053sol', feeRate: 2 };

      return { feeSize: '0.35%+rent fees', feeRate: 2 };
      // try {
      //   const resp = await privacyApiService.fetchPrivacyCashFees();
      //   const symbol =
      //     addr_to_symbol_map[toPrivacyCashTokenAddr(formValue.fromAsset.address).toLowerCase()];
      //   const rentFee = resp.rent_fees[symbol].toFixed(3);
      //   const fullFee = `0.35%+${rentFee}${symbol}`;
      //   return { feeSize: fullFee, feeRate: 2 };
      // } catch (err) {
      //   return Promise.resolve({ feeSize: '0.35%+rent fees', feeRate: 2 });
      // }
    },
    url: PRIVATE_MODE_URLS.PRIVACY_CASH,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.PRIVACY_CASH],
    name: PRIVATE_TRADE_TYPE.PRIVACY_CASH,
    uiName: 'PrivacyCash',
    privacyType: 'Dual exchange system +Randomized L1',
    security: 3,
    executionTimeRate: 1
  },
  CLEARSWAP: {
    //getMinAmountUsd: () => 49,
    getExecutionStepsInfo: () => ACTION_STEPS.ONE,
    getFeeInfo: () => Promise.resolve({ feeSize: '0.25%', feeRate: 2 }),
    url: PRIVATE_MODE_URLS.CLEARSWAP,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.CLEARSWAP],
    name: PRIVATE_TRADE_TYPE.CLEARSWAP,
    privacyType: 'Dual exchange system',
    uiName: 'Clearswap',
    security: 3,
    executionTimeRate: 2
  },
  HOUDINI: {
    //getMinAmountUsd: () => 50,
    getExecutionStepsInfo: () => ACTION_STEPS.ONE,
    getFeeInfo: () => Promise.resolve({ feeSize: '0.8%', feeRate: 3 }),
    url: PRIVATE_MODE_URLS.HOUDINI,
    icon: PRIVATE_PROVIDERS_ICONS[PRIVATE_TRADE_TYPE.HOUDINI],
    name: PRIVATE_TRADE_TYPE.HOUDINI,
    privacyType: 'Dual-exchange system with privacy token intermediary',
    uiName: 'Houdini',
    warning: {
      message: 'long swap',
      hint: 'Private transactions take 20–40 minutes on average.'
    },
    security: 3,
    executionTimeRate: 2
  }
};

export const PRIVATE_PROVIDERS_UI = Object.values(PRIVATE_PROVIDERS_DEFAULT_CONFIG);

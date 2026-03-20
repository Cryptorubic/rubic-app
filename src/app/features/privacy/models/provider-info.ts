import { PrivateModeTab } from '../constants/private-mode-tab';
import { PrivateTradeType } from '../constants/private-trade-types';
import { PrivacyFormValue } from '../services/models/privacy-form';
import { PrivacyApiService } from '../services/privacy-api.service';
import { PrivateProviderUrl } from './routes';

export interface PrivateProviderInfoUI {
  name: PrivateTradeType;
  uiName: string;
  privacyType: string;
  security: number;
  icon: `assets/images/private-swaps/common/${string}`;
  url: PrivateProviderUrl;
  warning?: { message: string; hint: string };
  minAmountUsd: number;
  feeSize: string;
}

export interface PrivateProviderRawInfo {
  name: PrivateTradeType;
  uiName: string;
  privacyType: string;
  security: number;
  icon: `assets/images/private-swaps/common/${string}`;
  url: PrivateProviderUrl;
  warning?: { message: string; hint: string };
  getMinAmountUsd: (tab: PrivateModeTab) => number;
  getFeeSize: (
    tab: PrivateModeTab,
    formValue: Partial<PrivacyFormValue>,
    privacyApiService: PrivacyApiService
  ) => Promise<string>;
}

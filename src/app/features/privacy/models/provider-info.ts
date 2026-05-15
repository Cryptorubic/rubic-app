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
  //minAmountUsd: number;
  executionTimeRate: number;
  feeInfo: { feeSize: string; feeRate: number };
  executionSteps: { steps: number; hint: string };
}

export interface PrivateProviderRawInfo {
  name: PrivateTradeType;
  uiName: string;
  privacyType: string;
  security: number;
  icon: `assets/images/private-swaps/common/${string}`;
  url: PrivateProviderUrl;
  warning?: { message: string; hint: string };
  executionTimeRate: number;
  //getMinAmountUsd: (tab: PrivateModeTab) => number;
  getExecutionStepsInfo: (tab: PrivateModeTab) => { steps: number; hint: string };
  getFeeInfo: (
    tab: PrivateModeTab,
    formValue: Partial<PrivacyFormValue>,
    privacyApiService: PrivacyApiService
  ) => Promise<{ feeSize: string; feeRate: number }>;
}

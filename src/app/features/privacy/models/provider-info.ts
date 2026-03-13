import { PrivateAction } from '../constants/private-mode-tx-types';
import { PrivateTradeType } from '../constants/private-trade-types';
import { PrivacyFormValue } from '../services/models/privacy-form';
import { PrivacyApiService } from '../services/privacy-api.service';
import { PrivareProviderUrl } from './routes';

export interface PrivateProviderInfoUI {
  name: PrivateTradeType;
  uiName: string;
  privacyType: string;
  security: number;
  icon: `assets/images/private-swaps/common/${string}`;
  url: PrivareProviderUrl;
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
  url: PrivareProviderUrl;
  warning?: { message: string; hint: string };
  getMinAmountUsd: (action: PrivateAction) => number;
  getFeeSize: (
    action: PrivateAction,
    formValue: Partial<PrivacyFormValue>,
    privacyApiService: PrivacyApiService
  ) => Promise<string>;
}

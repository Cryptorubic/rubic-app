import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { FormControlType } from '@app/shared/models/utils/angular-forms-types';

export interface PrivacyFormValue {
  fromAsset: BalanceToken | null;
  toAsset: BalanceToken | null;
}

export type PrivacyForm = FormControlType<PrivacyFormValue>;

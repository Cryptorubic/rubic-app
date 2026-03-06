import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { FormControlType } from '@app/shared/models/utils/angular-forms-types';

export interface PrivacyFormValue {
  fromToken: BalanceToken | null;
  toToken: BalanceToken | null;
}

export type PrivacyForm = FormControlType<PrivacyFormValue>;

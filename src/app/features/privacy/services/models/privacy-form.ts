import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { FormControlType } from '@app/shared/models/utils/angular-forms-types';
import BigNumber from 'bignumber.js';

export interface PrivacyFormValue {
  fromToken: BalanceToken | null;
  toToken: BalanceToken | null;
  fromAmount: {
    visibleValue: string;
    actualValue: BigNumber;
  } | null;
}

export type PrivacyForm = FormControlType<PrivacyFormValue>;

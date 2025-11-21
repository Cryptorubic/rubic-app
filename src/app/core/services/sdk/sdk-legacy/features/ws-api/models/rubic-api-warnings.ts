import { RubicSdkError } from '@cryptorubic/web3';

export interface RubicApiWarnings {
  needAuthWallet: boolean;
  error?: RubicSdkError;
}

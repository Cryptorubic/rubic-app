import { PrivateTradeType } from '../../constants/private-trade-types';

export interface PrivacyLocalStorage {
  ALREADY_SHIELDED: {
    [key in PrivateTradeType]: boolean;
  };

  FIRST_TIME_PRIVACY: boolean;

  PRIVACY_REF_CODE: string | null;
}

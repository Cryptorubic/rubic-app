import { PrivateTradeType } from '../../constants/private-trade-types';

export interface PrivacyLocalStorage {
  ALREADY_SHIELDED: {
    [key in PrivateTradeType]: boolean;
  };
}

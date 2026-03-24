import { PrivateTradeType } from '../../constants/private-trade-types';

export interface PrivacyLocalStorage {
  SHIELDING_STATUS: {
    [key in PrivateTradeType]: boolean;
  };
}

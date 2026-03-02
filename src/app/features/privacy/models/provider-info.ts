import { PrivateTradeType } from '../constants/private-trade-types';
import { PrivareProviderUrl } from './routes';

export interface PrivateProviderInfoUI {
  name: PrivateTradeType;
  privacyType: string;
  feeSize: 'low' | 'average' | 'high';
  securityPercent: number;
  icon: `assets/images/private-swaps/common/${string}`;
  url: PrivareProviderUrl;
  shieldingDurationSecs?: number;
}

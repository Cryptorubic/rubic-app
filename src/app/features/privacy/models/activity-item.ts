import { PrivateTradeType } from '../constants/private-trade-types';

export interface PrivateActivityItem {
  type: 'swap' | 'transfer';
  providerName: PrivateTradeType;
  icon: `assets/images/private-swaps/common/${string}`;
}

export type PrivateActivityStorageItem = Omit<PrivateActivityItem, 'icon'>;

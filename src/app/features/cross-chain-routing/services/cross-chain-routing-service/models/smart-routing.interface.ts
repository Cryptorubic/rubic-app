import BigNumber from 'bignumber.js';

export interface SmartRouting {
  fromProvider: string;
  toProvider: string;
  fromHasTrade: boolean;
  toHasTrade: boolean;
  savings: BigNumber;
}

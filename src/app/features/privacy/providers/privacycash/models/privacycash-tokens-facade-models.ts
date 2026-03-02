import BigNumber from 'bignumber.js';

export interface TokenAddrWithBalance {
  address: string;
  balanceWei: BigNumber;
}

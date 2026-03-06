import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import BigNumber from 'bignumber.js';

export interface TokenAddrWithBalance {
  address: string;
  balanceWei: BigNumber;
}

export interface MinimalTokenWithBalance extends MinimalToken {
  balanceWei: BigNumber;
}

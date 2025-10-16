import { Token } from '@app/shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { FeeInfo } from '@cryptorubic/sdk';

export type ProviderInfo = {
  name: string;
  image: string;
  color: string;
  averageTime?: number;
};

export interface AppGasData {
  amount: BigNumber;
  amountInUsd: BigNumber;
  symbol: string;
}

export interface AppFeeInfo {
  fee: FeeInfo;
  nativeToken: Token;
}

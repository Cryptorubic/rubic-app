import { FeeInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { Token } from '@app/shared/models/tokens/token';
import BigNumber from 'bignumber.js';

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

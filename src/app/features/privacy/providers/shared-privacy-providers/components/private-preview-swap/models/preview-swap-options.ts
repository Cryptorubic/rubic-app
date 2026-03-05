import { FeeInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { AppGasData } from '@app/features/trade/models/provider-info';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';

export type PreviewSwapWarning = { text: string; link?: string };

export type PrivateSwapType = 'shield' | 'unshield' | 'transfer' | 'swap';

export interface PrivateStep {
  label: string;
  action: () => Promise<void | boolean>;
  disabled?: boolean;
}

export interface PrivateSwapOptions {
  gasInfo?: AppGasData;
  feeInfo?: FeeInfo;
  warnings?: PreviewSwapWarning[];
  steps: PrivateStep[];
}

export interface PreviewPrivateSwapOptions {
  fromToken: BalanceToken;
  toToken: BalanceToken;
  swapType: PrivateSwapType;

  swapOptions: PrivateSwapOptions;
}

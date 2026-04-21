import { FeeInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { AppGasData } from '@app/features/trade/models/provider-info';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { SwapAmount } from '../../../models/swap-info';

export type PreviewSwapWarning = { text: string; link?: string };

export type PrivateSwapType = 'shield' | 'unshield' | 'transfer' | 'swap' | 'refund';

export interface PrivateStep {
  label: string;
  action: () => Promise<void | boolean>;
  disabled?: boolean;
}

export interface PrivateSwapOptions {
  srcTokenAmount?: string;
  dstTokenAmount?: string;
  gasInfo?: AppGasData;
  feeInfo?: FeeInfo;
  displayAmount?: string | null;
  warnings?: PreviewSwapWarning[];
  swapType?: PrivateSwapType;
  steps: PrivateStep[];
  hideFeeInfo?: boolean;
  gasTokens?: BalanceToken[];
}

export interface PreviewPrivateSwapOptions {
  fromToken: BalanceToken;
  toToken: BalanceToken;
  fromAmount: SwapAmount;
  toAmount: SwapAmount;
  swapType: PrivateSwapType;
  swapOptions: PrivateSwapOptions;
}

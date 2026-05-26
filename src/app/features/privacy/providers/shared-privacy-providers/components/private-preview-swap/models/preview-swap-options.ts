import { FeeInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { AppGasData } from '@app/features/trade/models/provider-info';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { SwapAmount } from '../../../models/swap-info';
import { GasToken } from '@app/shared/models/tokens/gas-token';
import { TuiDialogContext } from '@taiga-ui/core';

export type PreviewSwapWarning = { text: string; link?: string };

export type PrivateSwapType = 'shield' | 'unshield' | 'transfer' | 'swap' | 'refund';

export type PrivateSwapLabel =
  | 'Done'
  | 'Transaction in process'
  | 'Private Transfer'
  | 'Transfer tokens'
  | 'Switch network'
  | 'Shield Tokens'
  | 'Approve'
  | 'Swap'
  | 'Refund tokens'
  | 'Unshield Tokens'
  | 'Finalize unshield';

export type PrivateActionRes = { txScannerUrl?: string };

export interface PrivateStep {
  label: PrivateSwapLabel;
  // @TODO_2273 remove `void | boolean` after all private providers changes
  action: (context: TuiDialogContext<void, PreviewPrivateSwapOptions>) => Promise<PrivateActionRes>;
  /**
   * if true - when step.action() method invoked - it calls setLoadingState() in private-preview-swap.component.ts
   * and shows loader
   */
  showLoaderOnAction: boolean;
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
  gasTokens?: GasToken[];
}

export interface PreviewPrivateSwapOptions {
  fromToken: BalanceToken;
  toToken: BalanceToken;
  fromAmount: SwapAmount;
  toAmount: SwapAmount;
  swapType: PrivateSwapType;
  swapOptions: PrivateSwapOptions;
}

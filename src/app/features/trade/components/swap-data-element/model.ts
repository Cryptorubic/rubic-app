import { AssetSelector } from '@app/shared/models/asset-selector';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';

export type HintAppearance = 'onDark' | '' | 'error';
export type HintDirection =
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right'
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left-top'
  | 'left'
  | 'left-bottom'
  | 'right-top'
  | 'right'
  | 'right-bottom';

export interface SwapDataElementConfig {
  feeIcon: string;
  withVerboseFeeHint: boolean;
  zeroFeeText?: string;
  gasIcon?: string;
  direction?: 'vertical' | 'horizontal';
}

export interface GasTokenData {
  asset: AssetSelector;
  token: BalanceToken;
  value: { tokenAmount: BigNumber; fiatAmount: string };
}

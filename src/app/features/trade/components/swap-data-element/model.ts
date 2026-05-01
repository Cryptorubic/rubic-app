import { AssetSelector } from '@app/shared/models/asset-selector';
import { GasToken } from '@app/shared/models/tokens/gas-token';
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
  token: GasToken;
  value: { tokenAmount: BigNumber; fiatAmount: string };
}

export type HintAppearance = 'onDark' | '' | 'error';
export type HintDirection =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'start-bottom'
  | 'start'
  | 'start-top'
  | 'end-top'
  | 'end'
  | 'end-bottom';

export interface SwapDataElementConfig {
  feeIcon: string;
  withVerboseFeeHint: boolean;
  zeroFeeText?: string;
}

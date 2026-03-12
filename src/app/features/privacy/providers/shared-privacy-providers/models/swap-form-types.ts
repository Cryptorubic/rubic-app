import { AssetsSelectorConfig } from '@app/features/trade/components/assets-selector/models/assets-selector-layout';

export interface PrivateSwapFormConfig {
  withSrcAmount: boolean;
  withDstAmount: boolean;
  withDstSelector: boolean;
  withReceiver: boolean;
  withActionButton: boolean;
  assetsSelectorConfig?: AssetsSelectorConfig;
  buttonText?: string;
}

export type PrivateTransferFormConfig = Omit<
  PrivateSwapFormConfig,
  'withDstAmount' | 'withDstSelector'
>;

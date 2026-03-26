import { AssetsSelectorConfig } from '@app/features/trade/components/assets-selector/models/assets-selector-layout';

export interface PrivateSwapFormConfig {
  withSrcAmount: boolean;
  withDstAmount: boolean;
  withDstSelector: boolean;
  withReceiver: boolean;
  withActionButton: boolean;
  withStatus?: boolean;
  assetsSelectorConfig?: AssetsSelectorConfig;
  buttonText?: string;
  receiverPlaceholder?: string;
}

export type PrivateTransferFormConfig = Omit<
  PrivateSwapFormConfig,
  'withDstAmount' | 'withDstSelector'
> & { withMaxBtn: boolean; direction?: 'from' | 'to' };

export type PrivateShieldFormConfig = PrivateTransferFormConfig;

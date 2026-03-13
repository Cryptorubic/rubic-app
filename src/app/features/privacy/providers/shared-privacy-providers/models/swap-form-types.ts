export interface PrivateSwapFormConfig {
  withSrcAmount: boolean;
  withDstAmount: boolean;
  withDstSelector: boolean;
  withReceiver: boolean;
  withActionButton: boolean;
  buttonText?: string;
}

export type PrivateTransferFormConfig = Omit<
  PrivateSwapFormConfig,
  'withDstAmount' | 'withDstSelector'
>;

export type PrivateShieldFormConfig = PrivateTransferFormConfig;

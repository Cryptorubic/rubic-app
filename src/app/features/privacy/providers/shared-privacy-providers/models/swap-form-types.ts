export interface PrivateSwapFormConfig {
  withSrcAmount: boolean;
  withDstAmount: boolean;
  withReceiver: boolean;
  withActionButton: boolean;
  buttonText?: string;
}

export type PrivateTransferFormConfig = Omit<PrivateSwapFormConfig, 'withDstAmount'>;

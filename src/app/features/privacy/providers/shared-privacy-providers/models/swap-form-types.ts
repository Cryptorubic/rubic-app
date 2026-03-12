export interface PrivateSwapFormConfig {
  withSrcAmount: boolean;
  withDstAmount: boolean;
  withReceiver: boolean;
  withActionButton: boolean;
}

export type PrivateTransferFormConfig = Omit<PrivateSwapFormConfig, 'withDstAmount'>;

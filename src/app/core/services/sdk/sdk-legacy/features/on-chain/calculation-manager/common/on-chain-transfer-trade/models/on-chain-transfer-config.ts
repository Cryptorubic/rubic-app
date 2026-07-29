export interface OnChainTransferConfig {
  depositAddress: string;
  amountToSend: string;
  exchangeId: string;
  extraFields?: {
    name: string;
    value: string;
  };
}

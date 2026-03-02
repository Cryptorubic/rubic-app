export interface CrossChainTransferConfig {
  depositAddress: string;
  amountToSend: string;
  exchangeId: string;
  intermidiateExchangeId?: string;
  extraFields?: {
    name: string;
    value: string;
  };
}

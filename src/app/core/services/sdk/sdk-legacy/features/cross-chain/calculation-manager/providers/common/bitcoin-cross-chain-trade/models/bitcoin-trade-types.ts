export interface BitcoinTransferTxApiResp {
  extraFields: { memo: string };
  depositAddress: string;
  value: string;
}

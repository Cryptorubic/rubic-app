export interface BridgeTableTransaction {
  fromNetwork: string;
  toNetwork: string;
  actualFromAmount: string;
  actualToAmount: string;
  ethSymbol: string;
  bscSymbol: string;
  updateTime: string;
  status: string;
  transaction_id: string;
  walletFromAddress: string;
  walletToAddress: string;
  walletDepositAddress: string;
  code: number;
  image_link: string;
}

export interface PanamaToken {
  name: string;
  symbol: string;
  ethSymbol: string;
  bscSymbol: string;
  icon: string;
  minAmount: number;
  maxAmount: number;
  bscContractAddress: string;
  bscContractDecimal: number;
  ethContractAddress: string;
  ethContractDecimal: number;
  ethToBscFee?: number;
  bscToEthFee?: number;
}

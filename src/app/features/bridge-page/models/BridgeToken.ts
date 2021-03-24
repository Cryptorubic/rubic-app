export interface BridgeToken {
  name: string;
  symbol: string;
  bcSymbol: string;
  ethSymbol: string;
  bscSymbol: string;
  icon: string;
  minAmount: number;
  maxAmount: number;
  promotion: boolean;
  enabled: boolean;
  bscContractAddress: string;
  bscContractDecimal: number;
  ethContractAddress: string;
  ethContractDecimal: string;
}

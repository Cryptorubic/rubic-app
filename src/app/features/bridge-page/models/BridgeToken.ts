export interface BridgeToken {
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
  ethContractDecimal: string;
  ethToBscFee?: number;
  bscToEthFee?: number;
  used_in_iframe?: boolean;
}

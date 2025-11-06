export interface SymbiosisErrorResponse {
  code: number;
  message: string;
}

export interface SymbiosisTokenInfo {
  address: string;
  chainId: number;
  decimals: number;
}

export interface SymbiosisTokenInfoWithAmount extends SymbiosisTokenInfo {
  amount: string;
}

export type SymbiosisTokenLimit = { min: string; max: string } & SymbiosisTokenInfo;

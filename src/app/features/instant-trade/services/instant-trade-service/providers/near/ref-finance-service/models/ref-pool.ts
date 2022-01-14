export interface RefPool {
  id: number;
  tokenIds: string[];
  supplies: { [key: string]: string };
  fee: number;
  shareSupply: string;
  tvl: number;
  token0_ref_price: string;
}

export interface PoolRPCView {
  id: number;
  token_account_ids: string[];
  token_symbols: string[];
  amounts: string[];
  total_fee: number;
  shares_total_supply: string;
  tvl: number;
  token0_ref_price: string;
  share: string;
  decimalsHandled?: boolean;
}

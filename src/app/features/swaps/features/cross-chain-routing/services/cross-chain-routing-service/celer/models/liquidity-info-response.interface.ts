export interface LiquiditInfoItem {
  chain: {
    id: number;
    name: string;
    contract_addr: string;
  };
  token: {
    token: {
      symbol: string;
      address: string;
      decimal: number;
    };
    name: string;
  };
  liquidity: number;
  liquidity_amt: number;
  total_liquidity: number;
  total_liquidity_amt: number;
}

export interface LiquidityInfoResponse {
  err: string | null;
  lp_info: LiquiditInfoItem[];
}

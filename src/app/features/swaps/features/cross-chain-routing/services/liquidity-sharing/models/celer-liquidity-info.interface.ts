export interface CelerLiquidityInfo {
  err: string;
  lp_info: {
    chain: {
      id: number;
    };
    token: {
      token: {
        symbol: string;
        address: string;
        decimals: number;
      };
    };
    total_liquidity_amt: number;
    total_liquidity: number;
  }[];
}

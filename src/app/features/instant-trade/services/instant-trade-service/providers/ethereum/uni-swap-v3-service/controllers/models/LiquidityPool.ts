export type FeeAmount = 500 | 3000 | 10000;

export interface LiquidityPool {
  address: string;
  token0: string;
  token1: string;
  fee: FeeAmount;
}

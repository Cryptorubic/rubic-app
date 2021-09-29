export type FeeAmount = 500 | 3000 | 10000;

export class LiquidityPool {
  public static isPoolWithTokens(pool: LiquidityPool, tokenA: string, tokenB: string): boolean {
    return (
      (pool.token0.toLowerCase() === tokenA.toLowerCase() &&
        pool.token1.toLowerCase() === tokenB.toLowerCase()) ||
      (pool.token1.toLowerCase() === tokenA.toLowerCase() &&
        pool.token0.toLowerCase() === tokenB.toLowerCase())
    );
  }

  constructor(
    public readonly address: string,
    public readonly token0: string,
    public readonly token1: string,
    public readonly fee: FeeAmount
  ) {}
}

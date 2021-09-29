import { compareAddresses } from 'src/app/shared/utils/utils';

export type FeeAmount = 500 | 3000 | 10000;

export class LiquidityPool {
  public static isPoolWithTokens(pool: LiquidityPool, tokenA: string, tokenB: string): boolean {
    return (
      (compareAddresses(pool.token0, tokenA) && compareAddresses(pool.token1, tokenB)) ||
      (compareAddresses(pool.token1, tokenA) && compareAddresses(pool.token0, tokenB))
    );
  }

  constructor(
    public readonly address: string,
    public readonly token0: string,
    public readonly token1: string,
    public readonly fee: FeeAmount
  ) {}
}

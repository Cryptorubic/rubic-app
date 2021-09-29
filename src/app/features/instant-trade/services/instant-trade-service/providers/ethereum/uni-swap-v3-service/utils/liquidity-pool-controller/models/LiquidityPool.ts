import { compareAddresses } from 'src/app/shared/utils/utils';

export type FeeAmount = 500 | 3000 | 10000;

export class LiquidityPool {
  constructor(
    public readonly address: string,
    public readonly token0: string,
    public readonly token1: string,
    public readonly fee: FeeAmount
  ) {}

  public isPoolWithTokens(tokenA: string, tokenB: string): boolean {
    return (
      (compareAddresses(this.token0, tokenA) && compareAddresses(this.token1, tokenB)) ||
      (compareAddresses(this.token1, tokenA) && compareAddresses(this.token0, tokenB))
    );
  }
}

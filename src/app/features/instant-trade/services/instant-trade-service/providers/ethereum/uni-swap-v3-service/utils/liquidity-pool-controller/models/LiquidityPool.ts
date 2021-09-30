import { compareAddresses } from 'src/app/shared/utils/utils';

export type FeeAmount = 500 | 3000 | 10000;

/**
 * Represents liquidity pool in uni v3.
 */
export class LiquidityPool {
  constructor(
    public readonly address: string,
    public readonly token0: string,
    public readonly token1: string,
    public readonly fee: FeeAmount
  ) {}

  /**
   * Checks if the pool contains passed tokens.
   * @param tokenA First token address.
   * @param tokenB Second token address.
   */
  public isPoolWithTokens(tokenA: string, tokenB: string): boolean {
    return (
      (compareAddresses(this.token0, tokenA) && compareAddresses(this.token1, tokenB)) ||
      (compareAddresses(this.token1, tokenA) && compareAddresses(this.token0, tokenB))
    );
  }
}

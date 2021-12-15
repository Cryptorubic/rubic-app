import { compareAddresses } from 'src/app/shared/utils/utils';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';

export type FeeAmount = 500 | 3000 | 10000;

/**
 * Represents liquidity pool in uni v3.
 */
export class LiquidityPool {
  constructor(
    public readonly address: string,
    public readonly token0: SymbolToken,
    public readonly token1: SymbolToken,
    public readonly fee: FeeAmount
  ) {}

  /**
   * Checks if the pool contains passed tokens.
   * @param tokenA First token address.
   * @param tokenB Second token address.
   */
  public isPoolWithTokens(tokenA: string, tokenB: string): boolean {
    return (
      (compareAddresses(this.token0.address, tokenA) &&
        compareAddresses(this.token1.address, tokenB)) ||
      (compareAddresses(this.token1.address, tokenA) &&
        compareAddresses(this.token0.address, tokenB))
    );
  }
}

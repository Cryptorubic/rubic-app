import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';

export interface UniswapV2InstantTrade extends InstantTrade {
  /**
   * Tokens in a swap route.
   */
  path: SymbolToken[];
}

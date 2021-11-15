import BigNumber from 'bignumber.js';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';

export interface UniswapV2Route {
  path: SymbolToken[];
  outputAbsoluteAmount: BigNumber;
}

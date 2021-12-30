import BigNumber from 'bignumber.js';
import { SymbolToken } from '@shared/models/tokens/symbol-token';

export interface UniswapV2Route {
  path: SymbolToken[];
  outputAbsoluteAmount: BigNumber;
}

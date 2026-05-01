import { TokenAmount } from '@cryptorubic/core';
import { HinkalPrivateOperation } from '../../../../models/hinkal-private-operations';

export interface EstimateFeeStructureParams {
  operation: HinkalPrivateOperation;
  feeTokenAddress: string;
  fromToken: TokenAmount;
  toToken: TokenAmount;
}

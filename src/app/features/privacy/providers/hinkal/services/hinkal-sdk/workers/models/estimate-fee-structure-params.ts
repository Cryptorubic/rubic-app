import { BlockchainName } from '@cryptorubic/core';
import { HinkalPrivateOperation } from '../../../../constants/hinkal-private-operations';

export interface EstimateFeeStructureParams {
  operation: HinkalPrivateOperation;
  feeTokenAddress: string;
  fromToken: {
    blockchain: BlockchainName;
    address: string;
  };
  toToken?: {
    blockchain: BlockchainName;
    address: string;
  };
}

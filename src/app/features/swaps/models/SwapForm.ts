import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { IToken } from '../../../shared/models/tokens/IToken';

export interface SwapForm {
  input: {
    fromBlockchain: BLOCKCHAIN_NAME;
    toBlockchain: BLOCKCHAIN_NAME;
    fromToken: IToken;
    toToken: IToken;
    fromAmount: BigNumber;
  };
  output: {
    toAmount: BigNumber;
  };
}

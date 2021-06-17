import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';

export interface SwapForm {
  input: {
    fromBlockchain: BLOCKCHAIN_NAME;
    toBlockchain: BLOCKCHAIN_NAME;
    fromToken: TokenAmount;
    toToken: TokenAmount;
    fromAmount: BigNumber;
  };
  output: {
    toAmount: BigNumber;
  };
}

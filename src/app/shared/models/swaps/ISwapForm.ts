import { FormGroup } from '@ngneat/reactive-forms';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';

export interface ISwapForm {
  input: FormGroup<ISwapFormInput>;
  output: FormGroup<ISwapFormOutput>;
}

export interface ISwapFormInput {
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  fromToken: TokenAmount;
  toToken: TokenAmount;
}

export interface ISwapFormOutput {
  toAmount: BigNumber;
}

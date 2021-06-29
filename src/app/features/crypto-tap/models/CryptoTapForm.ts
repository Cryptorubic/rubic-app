import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';

import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapForm, ISwapFormInput, ISwapFormOutput } from 'src/app/shared/models/swaps/ISwapForm';

export interface CryptoTapForm extends ISwapForm {
  input: FormGroup<CryptoTapFormInput>;
  output: FormGroup<CryptoTapFormOutput>;
}

export interface CryptoTapFormInput extends ISwapFormInput {
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  fromToken: TokenAmount;
  toToken: TokenAmount;
}

export interface CryptoTapFormOutput extends ISwapFormOutput {
  fromAmount: BigNumber;
  toAmount: BigNumber;
  fee: {
    token: TokenAmount;
    amount: BigNumber;
  };
}

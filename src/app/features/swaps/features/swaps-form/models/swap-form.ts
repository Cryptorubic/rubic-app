import BigNumber from 'bignumber.js';
import { BlockchainName } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { FormGroup } from '@ngneat/reactive-forms';

export interface SwapForm {
  input: FormGroup<SwapFormInput>;
  output: FormGroup<SwapFormOutput>;
}

export interface SwapFormInput {
  fromBlockchain: BlockchainName | null;
  toBlockchain: BlockchainName;
  fromToken: TokenAmount;
  toToken: TokenAmount;
  fromAmount: BigNumber;
}

export interface SwapFormOutput {
  toAmount: BigNumber;
}

import BigNumber from 'bignumber.js';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapForm, ISwapFormInput, ISwapFormOutput } from '@shared/models/swaps/swap-form';

export interface SwapForm extends ISwapForm {
  input: FormGroup<SwapFormInput>;
  output: FormGroup<SwapFormOutput>;
}

export interface SwapFormInput extends ISwapFormInput {
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  fromToken: TokenAmount;
  toToken: TokenAmount;
  fromAmount: BigNumber;
}

export interface SwapFormOutput extends ISwapFormOutput {
  toAmount: BigNumber;
}

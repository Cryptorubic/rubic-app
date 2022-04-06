import { FormGroup } from '@ngneat/reactive-forms';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';

export interface ISwapForm {
  input: FormGroup<ISwapFormInput>;
  output: FormGroup<ISwapFormOutput>;
}

export interface ISwapFormInput {
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  fromToken: TokenAmount;
  toToken: TokenAmount;
}

export interface ISwapFormOutput {
  toAmount: BigNumber;
}

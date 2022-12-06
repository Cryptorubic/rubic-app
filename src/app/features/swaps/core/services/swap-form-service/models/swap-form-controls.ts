import { BlockchainName } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { FormControl, FormGroup } from '@angular/forms';

export interface SwapForm {
  input: FormGroup<SwapFormInputControl>;
  output: FormGroup<SwapFormOutputControl>;
}

export interface SwapFormInput {
  fromBlockchain: BlockchainName | null;
  toBlockchain: BlockchainName;
  fromToken: TokenAmount;
  toToken: TokenAmount;
  fromAmount: BigNumber;
}

export interface SwapFormInputControl {
  fromBlockchain: FormControl<BlockchainName | null>;
  toBlockchain: FormControl<BlockchainName>;
  fromToken: FormControl<TokenAmount>;
  toToken: FormControl<TokenAmount>;
  fromAmount: FormControl<BigNumber>;
}

export interface SwapFormOutput {
  toAmount: BigNumber;
}

export interface SwapFormOutputControl {
  toAmount: FormControl<BigNumber>;
}

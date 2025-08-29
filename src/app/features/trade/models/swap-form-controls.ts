import { BlockchainName } from '@cryptorubic/sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { FormGroup } from '@angular/forms';
import { FormControlType } from '@shared/models/utils/angular-forms-types';

export interface SwapFormInput {
  fromBlockchain: BlockchainName | null;
  fromToken: TokenAmount | null;
  fromAmount: {
    visibleValue: string;
    actualValue: BigNumber;
  } | null;

  toBlockchain: BlockchainName | null;
  toToken: TokenAmount | null;
}

export type SwapFormInputControl = FormControlType<SwapFormInput>;

export interface SwapFormOutput {
  toAmount: BigNumber | null;
}

export type SwapFormOutputControl = FormControlType<SwapFormOutput>;

export interface SwapForm {
  input: FormGroup<SwapFormInputControl>;
  output: FormGroup<SwapFormOutputControl>;
}

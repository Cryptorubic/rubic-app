import { BlockchainName } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { FormControl, FormGroup } from '@angular/forms';
import { FromAsset, FromAssetType } from '@features/swaps/shared/models/form/asset';

export interface SwapFormInput {
  fromAssetType: FromAssetType | null;
  fromAsset: FromAsset | null;

  toBlockchain: BlockchainName | null;
  toToken: TokenAmount | null;

  fromAmount: BigNumber | null;
}

// repeats previous interface, wrapping in FormControl
export interface SwapFormInputControl {
  fromAssetType: FormControl<FromAssetType | null>;
  fromAsset: FormControl<FromAsset | null>;

  toBlockchain: FormControl<BlockchainName | null>;
  toToken: FormControl<TokenAmount | null>;

  fromAmount: FormControl<BigNumber | null>;
}

export interface SwapFormOutput {
  toAmount: BigNumber | null;
}

// repeats previous interface, wrapping in FormControl
export interface SwapFormOutputControl {
  toAmount: FormControl<BigNumber | null>;
}

export interface SwapForm {
  input: FormGroup<SwapFormInputControl>;
  output: FormGroup<SwapFormOutputControl>;
}

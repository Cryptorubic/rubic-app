import { BlockchainName } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { FormControl, FormGroup } from '@angular/forms';
import { Asset, AssetType } from '@features/swaps/shared/models/form/asset';

export interface SwapFormInput {
  fromAssetType: AssetType | null;
  fromAsset: Asset | null;

  toBlockchain: BlockchainName | null;
  toToken: TokenAmount | null;

  fromAmount: BigNumber | null;
}

// repeats previous interface, wrapping in FormControl
export interface SwapFormInputControl {
  fromAssetType: FormControl<AssetType | null>;
  fromAsset: FormControl<Asset | null>;

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

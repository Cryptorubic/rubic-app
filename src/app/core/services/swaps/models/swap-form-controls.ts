import { BlockchainName } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { FormGroup } from '@angular/forms';
import { Asset, AssetType } from '@features/swaps/shared/models/form/asset';
import { FormControlType } from '@shared/models/utils/angular-forms-types';

export interface SwapFormInput {
  fromAssetType: AssetType | null;
  fromAsset: Asset | null;

  toBlockchain: BlockchainName | null;
  toToken: TokenAmount | null;

  fromAmount: BigNumber | null;
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

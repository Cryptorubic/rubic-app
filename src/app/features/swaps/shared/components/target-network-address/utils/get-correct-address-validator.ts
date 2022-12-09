import { ValidatorFn } from '@angular/forms';
import { BlockchainName } from 'rubic-sdk';
import { AssetType } from '@features/swaps/shared/models/form/asset';
import { correctAddressValidator } from '@features/swaps/shared/components/target-network-address/utils/correct-address-validator';

export function getCorrectAddressValidator(inputForm: {
  fromAssetType: AssetType;
  toBlockchain: BlockchainName;
}): ValidatorFn {
  return correctAddressValidator(inputForm.fromAssetType, inputForm.toBlockchain);
}

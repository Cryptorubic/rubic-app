import { ValidatorFn } from '@angular/forms';
import { correctAddressValidator } from '@features/swaps/shared/components/target-network-address/services/utils/correct-address-validator';
import { BlockchainName } from 'rubic-sdk';
import { AssetType } from '@features/swaps/shared/models/form/asset';

export function getCorrectAddressValidator(inputForm: {
  fromAssetType: AssetType;
  toBlockchain: BlockchainName;
}): ValidatorFn {
  return correctAddressValidator(inputForm.fromAssetType, inputForm.toBlockchain);
}

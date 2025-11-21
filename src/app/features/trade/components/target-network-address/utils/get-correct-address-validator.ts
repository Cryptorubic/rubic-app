import { AsyncValidatorFn } from '@angular/forms';
import { BlockchainName } from '@cryptorubic/core';
import { AssetType } from '@features/trade/models/asset';
import { correctAddressValidator } from '@features/trade/components/target-network-address/utils/correct-address-validator';

export function getCorrectAddressValidator(inputForm: {
  fromAssetType: AssetType;
  validatedChain: BlockchainName;
}): AsyncValidatorFn {
  if (inputForm.validatedChain) {
    return correctAddressValidator(inputForm.fromAssetType, inputForm.validatedChain);
  }
  return () => new Promise(resolve => resolve(null));
}

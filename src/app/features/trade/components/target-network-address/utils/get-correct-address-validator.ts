import { AsyncValidatorFn } from '@angular/forms';
import { BlockchainName } from '@cryptorubic/sdk';
import { correctAddressValidator } from '@features/trade/components/target-network-address/utils/correct-address-validator';
import { AssetListType } from '@features/trade/models/asset';

export function getCorrectAddressValidator(inputForm: {
  fromAssetType: AssetListType;
  validatedChain: BlockchainName;
}): AsyncValidatorFn {
  if (inputForm.validatedChain) {
    return correctAddressValidator(inputForm.fromAssetType, inputForm.validatedChain);
  }
  return () => new Promise(resolve => resolve(null));
}

import { AsyncValidatorFn } from '@angular/forms';
import { BlockchainName } from 'rubic-sdk';
import { AssetType } from '@features/trade/models/asset';
import { correctAddressValidator } from '@features/trade/components/target-network-address/utils/correct-address-validator';

export function getCorrectAddressValidator(inputForm: {
  fromAssetType: AssetType;
  toBlockchain: BlockchainName;
}): AsyncValidatorFn {
  if (inputForm.toBlockchain) {
    return correctAddressValidator(inputForm.fromAssetType, inputForm.toBlockchain);
  }
  return () => null;
}

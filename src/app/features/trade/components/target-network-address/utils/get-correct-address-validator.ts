import { AsyncValidatorFn } from '@angular/forms';
import { BlockchainName } from '@cryptorubic/core';
import {
  ReceiverAddressValidatorOptions,
  correctAddressValidator
} from '@features/trade/components/target-network-address/utils/correct-address-validator';
import { AssetListType } from '@features/trade/models/asset';

const defaultOptions: ReceiverAddressValidatorOptions = { requiredReceiver: false };

export function getCorrectAddressValidator(
  inputForm: {
    fromAssetType: AssetListType;
    validatedChain: BlockchainName;
  },
  options: ReceiverAddressValidatorOptions = defaultOptions
): AsyncValidatorFn {
  if (inputForm.validatedChain) {
    return correctAddressValidator(inputForm.fromAssetType, inputForm.validatedChain, options);
  }
  return () => new Promise(resolve => resolve(null));
}

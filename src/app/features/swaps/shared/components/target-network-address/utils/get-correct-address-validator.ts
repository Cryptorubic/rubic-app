import { ValidatorFn } from '@ngneat/reactive-forms';
import { correctAddressValidator } from '@features/swaps/shared/components/target-network-address/services/utils/correct-address-validator';
import { BlockchainName } from 'rubic-sdk';

export function getCorrectAddressValidator(inputForm: {
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
}): ValidatorFn {
  return correctAddressValidator(inputForm.fromBlockchain, inputForm.toBlockchain);
}

import { BlockchainName, BlockchainsInfo, Web3Pure } from 'rubic-sdk';
import { AbstractControl, ValidatorFn } from '@ngneat/reactive-forms';
import { ValidationErrors } from '@ngneat/reactive-forms/lib/types';
import { blockchainRequiresAddress } from '@features/swaps/shared/target-network-address/services/constants/blockchain-requires-address';

export function correctAddressValidator(blockchain: BlockchainName): ValidatorFn {
  const chainType = BlockchainsInfo.getChainType(blockchain);

  return (control: AbstractControl): ValidationErrors | null => {
    const address = control.value;

    if (!Web3Pure[chainType].isAddressCorrect(address)) {
      if (address || blockchainRequiresAddress.some(el => el === blockchain)) {
        return { wrongAddress: address };
      }
    }
    return null;
  };
}

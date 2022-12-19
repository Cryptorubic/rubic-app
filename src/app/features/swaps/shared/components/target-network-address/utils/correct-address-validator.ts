import { BlockchainName, BlockchainsInfo, Web3Pure } from 'rubic-sdk';
import { blockchainRequiresAddress } from '@features/swaps/core/services/target-network-address-service/constants/blockchain-requires-address';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AssetType } from '@features/swaps/shared/models/form/asset';

export function correctAddressValidator(
  fromAssetType: AssetType,
  toBlockchain: BlockchainName
): ValidatorFn {
  const toChainType = BlockchainsInfo.getChainType(toBlockchain);

  return (control: AbstractControl): ValidationErrors | null => {
    const address = control.value;

    if (!Web3Pure[toChainType].isAddressCorrect(address)) {
      if (
        address ||
        (fromAssetType !== toBlockchain &&
          blockchainRequiresAddress.some(el => el === fromAssetType || el === toBlockchain))
      ) {
        return { wrongAddress: address };
      }
    }
    return null;
  };
}

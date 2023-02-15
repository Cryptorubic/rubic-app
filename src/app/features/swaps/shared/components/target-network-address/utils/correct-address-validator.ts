import { BlockchainName, BlockchainsInfo, Web3Pure } from 'rubic-sdk';
import { blockchainRequiresAddress } from '@features/swaps/core/services/target-network-address-service/constants/blockchain-requires-address';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AssetType } from '@features/swaps/shared/models/form/asset';
import { CHAIN_TYPE } from 'rubic-sdk/lib/core/blockchain/models/chain-type';

export function correctAddressValidator(
  fromAssetType: AssetType,
  toBlockchain: BlockchainName
): ValidatorFn {
  let toChainType: CHAIN_TYPE | undefined;
  try {
    toChainType = BlockchainsInfo.getChainType(toBlockchain);
  } catch {}

  return (control: AbstractControl): ValidationErrors | null => {
    const address = control.value;

    if (toChainType && !Web3Pure[toChainType].isAddressCorrect(address)) {
      if (
        address ||
        (fromAssetType !== toBlockchain &&
          blockchainRequiresAddress.some(el => el === fromAssetType || el === toBlockchain))
      ) {
        return { wrongAddress: address };
      }
    }
    if (!toChainType) {
      return !address?.length ? { wrongAddress: address } : null;
    }
    return null;
  };
}

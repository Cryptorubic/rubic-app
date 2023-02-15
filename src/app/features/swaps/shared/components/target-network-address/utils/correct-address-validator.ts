import { BlockchainName, BlockchainsInfo, Web3Pure } from 'rubic-sdk';
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
      let fromChainType: CHAIN_TYPE | undefined;
      try {
        fromChainType = BlockchainsInfo.getChainType(fromAssetType as BlockchainName);
      } catch {}
      if (address || fromChainType !== toChainType) {
        return { wrongAddress: address };
      }
    }
    if (!toChainType) {
      return !address?.length ? { wrongAddress: address } : null;
    }
    return null;
  };
}

import { BlockchainName, BlockchainsInfo, ChainType, Web3Pure } from 'rubic-sdk';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AssetType } from '@features/swaps/shared/models/form/asset';

export function correctAddressValidator(
  fromAssetType: AssetType,
  toBlockchain: BlockchainName
): AsyncValidatorFn {
  const toChainType = BlockchainsInfo.getChainType(toBlockchain);

  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const address = control.value;

    const isAddressCorrectValue = await Web3Pure[toChainType].isAddressCorrect(address);

    if (toChainType && !isAddressCorrectValue) {
      let fromChainType: ChainType;
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

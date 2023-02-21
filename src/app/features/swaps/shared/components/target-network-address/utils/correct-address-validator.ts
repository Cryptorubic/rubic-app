import { BlockchainName, BlockchainsInfo, Web3Pure } from 'rubic-sdk';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AssetType } from '@features/swaps/shared/models/form/asset';
import { CHAIN_TYPE } from 'rubic-sdk/lib/core/blockchain/models/chain-type';

export function correctAddressValidator(
  fromAssetType: AssetType,
  toBlockchain: BlockchainName
): AsyncValidatorFn {
  const toChainType: CHAIN_TYPE = BlockchainsInfo.getChainType(toBlockchain);

  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const address = control.value;

    if (address === '') {
      return null;
    }

    const isAddressCorrectValue = await Web3Pure[toChainType].isAddressCorrect(address);

    if (toChainType && !isAddressCorrectValue) {
      let fromChainType: CHAIN_TYPE;
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

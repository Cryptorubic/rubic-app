import { BlockchainName, BlockchainsInfo, Web3Pure } from 'rubic-sdk';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AssetType } from '@features/trade/models/asset';

export function correctAddressValidator(
  fromAssetType: AssetType,
  validatedChain: BlockchainName
): AsyncValidatorFn {
  const validatedChainType = BlockchainsInfo.getChainType(validatedChain);
  const fromChainType = BlockchainsInfo.getChainType(fromAssetType as BlockchainName);

  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const address = control.value;

    const isAddressCorrectValue =
      address === '' || (await Web3Pure[validatedChainType].isAddressCorrect(address));

    if (!isAddressCorrectValue && (address || fromChainType !== validatedChainType)) {
      return { wrongAddress: address };
    }

    if (!validatedChainType) {
      return !address?.length ? { wrongAddress: address } : null;
    }
    return null;
  };
}

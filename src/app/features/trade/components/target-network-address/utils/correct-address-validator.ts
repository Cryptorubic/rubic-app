import { BlockchainName, BlockchainsInfo, Web3Pure } from '@cryptorubic/sdk';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AssetListType } from '@features/trade/models/asset';

export function correctAddressValidator(
  fromAssetType: AssetListType,
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

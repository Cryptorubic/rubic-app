import { BlockchainName, BlockchainsInfo } from '@cryptorubic/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AssetType } from '@features/trade/models/asset';
import { Web3Pure } from '@cryptorubic/web3';

export function correctAddressValidator(
  fromAssetType: AssetType,
  validatedChain: BlockchainName
): AsyncValidatorFn {
  const validatedChainType = BlockchainsInfo.getChainType(validatedChain);
  const fromChainType = BlockchainsInfo.getChainType(fromAssetType as BlockchainName);

  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const address = control.value;

    const isAddressCorrectValue =
      address === '' || (await Web3Pure.isAddressCorrect(validatedChain, address));

    if (!isAddressCorrectValue && (address || fromChainType !== validatedChainType)) {
      return { wrongAddress: address };
    }

    if (!validatedChainType) {
      return !address?.length ? { wrongAddress: address } : null;
    }
    return null;
  };
}

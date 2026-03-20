import { BlockchainName, BlockchainsInfo } from '@cryptorubic/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AssetListType } from '@features/trade/models/asset';
import { Web3Pure } from '@cryptorubic/web3';

export interface ReceiverAddressValidatorOptions {
  requiredReceiver: boolean;
}

export function correctAddressValidator(
  fromAssetType: AssetListType,
  validatedChain: BlockchainName,
  options: ReceiverAddressValidatorOptions
): AsyncValidatorFn {
  const validatedChainType = BlockchainsInfo.getChainType(validatedChain);
  const fromChainType = BlockchainsInfo.getChainType(fromAssetType as BlockchainName);

  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const address = control.value;

    const isAddressCorrectValue =
      !Boolean(address) || (await Web3Pure.isAddressCorrect(validatedChain, address));

    if (address && options.requiredReceiver && !isAddressCorrectValue) {
      return { wrongAddress: address };
    }
    if (!isAddressCorrectValue && (address || fromChainType !== validatedChainType)) {
      return { wrongAddress: address };
    }

    if (!validatedChainType) {
      return !address?.length ? { wrongAddress: address } : null;
    }
    return null;
  };
}

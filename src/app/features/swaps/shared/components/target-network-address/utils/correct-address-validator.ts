import { BlockchainName, BlockchainsInfo, Web3Pure } from 'rubic-sdk';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AssetType } from '@features/swaps/shared/models/form/asset';
import { CHAIN_TYPE } from 'rubic-sdk/lib/core/blockchain/models/chain-type';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export function correctAddressValidator(
  fromAssetType: AssetType,
  toBlockchain: BlockchainName
): AsyncValidatorFn {
  let toChainType: CHAIN_TYPE;
  try {
    toChainType = BlockchainsInfo.getChainType(toBlockchain);
  } catch {}

  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const address = control.value;

    if (address === '') {
      return of(null);
    }

    return from(Web3Pure[toChainType].isAddressCorrect(address)).pipe(
      map(isAddressCorrect => {
        if (toChainType && !isAddressCorrect) {
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
      }),
      catchError(error => {
        console.log(error);
        return of(null);
      })
    );
  };
}
